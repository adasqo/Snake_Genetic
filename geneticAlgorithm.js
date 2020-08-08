
function inputMatrixDot(A, B, b, c) 
{
    var vector = new Array();
    for(var k=0; k<c; k++)
    {
        var sum = 0;
        for(var l=0; l<b; l++)
            sum += A[l]*B[k][l];
        vector[k] = sum;
    }
    return vector;
}


function generateBrain(inputSize, hiddenSize, outputSize)
{
    var hiddenLayer1 = new Array();
    var hiddenLayer2 = new Array();
    var outputLayer = new Array();
    var k = 0, l = 0;
    for(k=0; k<hiddenSize; ++k)
    {
        var vector = new Array();
        for(l=0;l<inputSize; l++)
            vector[l] = 2*(Math.random()-0.5);

        hiddenLayer1[k] = vector;
    }

    for(k=0; k<hiddenSize; ++k)
    {
        var vector = new Array();
        for(l=0;l<hiddenSize + 1; l++)
            vector[l] = 2*(Math.random()-0.5);
        hiddenLayer2[k] = vector; 
    }

    for(k=0; k<outputSize; ++k)
    {
        var vector = new Array();
        for(l=0;l<hiddenSize + 1; l++)
            vector[l] = 2*(Math.random()-0.5);
        outputLayer[k] = vector;
    }
    return [hiddenLayer1, hiddenLayer2, outputLayer];
}

function getMove(layers, windowSize, positionsOfSnake, positionOfFood, prevPosition)
{
    var input = createInput(windowSize, positionsOfSnake, positionOfFood, prevPosition);
    var hiddenLayer1 = layers[0];
    var hiddenLayer2 = layers[1];
    var outputLayer = layers[2];
    var hiddenResult1 = inputMatrixDot(input, hiddenLayer1, windowSize, hiddenLayer1.length);
    var hiddenResultDot1 = new Array();
    var hiddenResultDot2 = new Array();
    var k;
    for(k=0; k<hiddenResult1.length; k++)
        hiddenResultDot1[k] = 1/(1 + Math.exp(hiddenResult1[k]));
    hiddenResultDot1[hiddenResultDot1.length] = 1;
    var hiddenResult2 = inputMatrixDot(hiddenResultDot1, hiddenLayer2, hiddenSize + 1, hiddenSize);
    for(k=0; k<hiddenResult2.length; k++)
        hiddenResultDot2[k] = 1/(1 + Math.exp(hiddenResult1[k]));
    hiddenResultDot2[hiddenResultDot2.length] = 1;
    var outputResult = inputMatrixDot(hiddenResultDot2, outputLayer, hiddenSize + 1, 4);
    maxValue = -1000000;
    maxIndex = 0;
    for(k=0; k<outputResult.length; k++)
    {
        if(outputResult[k] > maxValue)
        {
            maxValue = outputResult[k];
            maxIndex = k;       
        }
    }
    return maxIndex;
}

function createInput(windowSize, positionsOfSnake, positionOfFood)
{
    var inputVector = new Array();

    windowSize = Math.floor(Math.sqrt(windowSize));
    var positionOfHead = positionsOfSnake[0];
    var span = (windowSize-1)/2;
    var k, l;
    var flag = false;
    for(k=0; k<windowSize; k++)
    {
        for(l=0; l<windowSize; l++)
        {
            var ii = positionOfHead[0] - span  + k;
            var jj = positionOfHead[1] - span  + l;

            for(var t=0;t<positionsOfSnake.length; t++)
            {
                if(positionsOfSnake[t][0] == ii && positionsOfSnake[t][1] == jj)
                {
                    inputVector.push([-2]);
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                flag = false;
                continue;
            }
            for(var t=0; t<positionOfFood.length; t++)
            {
                if(ii == positionOfFood[t][0] && jj == positionOfFood[t][1])
                {
                    inputVector.push([1]);
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                flag = false;
                continue;
            }

            if(ii < 0 || ii > 19 || jj < 0 || jj > 19)
                inputVector.push([-1]);
            else
                inputVector.push([0]);
        }
    }
    // var flag = false;
    // for(var k=0; k< 20; k++)
    // {
    //     for(var l=0; l < 20; l++)
    //     {
    //         for(var t=0;t<positionsOfSnake.length; t++)
    //         {
    //             if(positionsOfSnake[t][0] == k && positionsOfSnake[t][1] == l)
    //             {
    //                 inputVector.push([-1]);
    //                 flag = true;
    //                 break;
    //             }
    //         }
    //         if(flag)
    //         {
    //             flag = false;
    //             continue;
    //         }
    //         for(var t=0; t<positionOfFood.length; t++)
    //         {
    //             if(k == positionOfFood[t][0] && k == positionOfFood[t][1])
    //             {
    //                 inputVector.push([1]);
    //                 flag = true;
    //                 break;
    //             }
    //         }
    //         if(flag)
    //         {
    //             flag = false;
    //             continue;
    //         }
    //         inputVector.push([0]);
    //     }
    // }


    //console.log(inputVector);
    return inputVector;
}

function breed(population1, population2)
{
    var newPop = []
    for(var k = 0; k < population1.length; k++)
    {
        var v = []
        for(var l=0; l < population1[k].length; l++)
        {
            var vector = []
            for(var t=0; t < population1[k][l].length; t++)
            {
                if(Math.random() < 0.7)
                    vector.push(population1[k][l][t]);
                else
                    vector.push(population2[k][l][t]);
                // var r1 = 0.2*Math.random() + 0.5;
                // var r2 = 1 - r1;
                // vector.push((r1*population1[k][l][t] + r2*population2[k][l][t]));
            }
            v.push(vector);
        }
        newPop.push(v)
    }
    return newPop;
}

function reproduce(topPopulations, topScores, windowSize, hiddenSize, top25Populations, top25Scores)
{
    newPopulation = new Array();
    if(top25Populations.length == 0)
    {
        for(var k=0; k < topPopulations.length; k++)
        {
            top25Populations[k] = topPopulations[k];
            top25Scores[k] = topScores[k];
        }
    }
    else
    {
        var scores = [];
        var populations = [];
        var indexes = [];

        for(var k=0; k < topPopulations.length; k++)
        {
            populations[k] = top25Populations[k];
            scores[k] = top25Scores[k];
            indexes[k] = k;
        }
        for(var k=0; k < topPopulations.length; k++)
        {
            populations[topPopulations.length + k] = topPopulations[k];
            scores[topPopulations.length + k] = topScores[k];
            indexes[topPopulations.length + k] = topPopulations.length + k;
        }
        
        indexes.sort(function (a, b) { return scores[a] < scores[b] ? 1 : scores[a] > scores[b] ? -1 : 0; })
        scores.sort(function (a, b) { return b - a; });
        
        //console.log(scores);

        topPopulations = [];
        top25Populations = [];
        top25Scores = [];

        for(var k=0; k < scores.length/2; k++)
        {
            topPopulations[k] = populations[indexes[k]];
            top25Populations[k] = populations[indexes[k]];
            top25Scores[k] = scores[k];
        }
    }
    console.log(top25Scores);
    // for(k = 0; k < 5; k++)
    //     console.log(scores[topPopulation[k]])

    // for(k = 0; k < 5; k++)
    //     for(var l = 0; l<2; l++)
    //     {
    //         newPopulation.push(mutate(breed(populations[topPopulation[k]], generateBrain(windowSize, hiddenSize, 4)), 0.1, 0.1));
    //         newPopulation.push(mutate(breed(populations[topPopulation[k]], populations[topPopulation[k]]), 0.2, 0.2));
    //     }
    randomIndexes = [];
    for(var k=0; k < 10; k++)
        randomIndexes[k] = Math.floor(Math.random()*15);
    for(var k = 0; k < 6; k++)
        for(var l = 0; l<10; l++)
            newPopulation.push(mutate(breed(topPopulations[k], topPopulations[randomIndexes[l]]), 0.1*l, 0.1*l));
    // for(var k = 0; k < 12; k++)
        // newPopulation.push(breed(topPopulations[k], generateBrain(windowSize, hiddenSize, 4)));
    
    // for(k = 0; k < 25; k++)
    //     console.log(scores[topPopulation[k]])
    // for(k = 0; k < 5; k++)
    //     for(var l = 5; l<25; l++)
    //     {
    //         if(l < 20)
    //             newPopulation.push(mutate(breed(populations[topPopulation[k]], populations[topPopulation[l]]), 0.2, 0.2));
    //         else
    //             newPopulation.push(mutate(breed(populations[topPopulation[k]], generateBrain(windowSize, hiddenSize, 4)), 0.2, 0.2));
    //     }
            

    // for(k=0; k<topPopulation.length; k++)
    // {
    //     newPopulation.push(populations[topPopulation[k]]);
    //     console.log(scores[topPopulation[k]])
    // }
    
    // for(k=0; k<topPopulation.length; k++)
    //     newPopulation.push(populations[topPopulation[k]]);

    // for(k=0; k<topPopulation.length; k++)
    //     newPopulation.push(populations[topPopulation[k]]);

    // for(k=0; k<topPopulation.length; k++)
    //     newPopulation.push(mutate(populations[topPopulation[k]], 0.25, 0.25));
    
    // for(k=0; k<topPopulation.length; k++)
    //     newPopulation.push(mutate(populations[topPopulation[k]], 0.75, 0.5));

    // for(k=0; k<topPopulation.length; k++)
    //     newPopulation.push(mutate(populations[topPopulation[k]], 1, 0.25));

    // for(k=0; k<topPopulation.length; k++)
    //    newPopulation.push(generateBrain(windowSize*windowSize, hiddenSize, 4));

    // for(k=0; k<topPopulation.length; k++)
    //    newPopulation.push(generateBrain(windowSize*windowSize, hiddenSize, 4));

    //console.log("new: ", newPopulation);

    newPopulation = shuffle(newPopulation);

    return [newPopulation, top25Populations, top25Scores];
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
function mutate(population, mutationChance, mutationSize)
{
    clonedPopulation = population;
    var k, l;
    for(k=0; k<population.length; k++)
        for(l=0; l<population[k].length; l++)
            if(Math.random() < mutationChance)
                for(var t=0; t<population[k][l].length; t++)
                    population[k][l][t] = population[k][l][t] + (Math.random()-0.5)*mutationSize;

    return population;
}

function renderFood(positionsOfSnake, positionOfFood, width, squares, color)
{
    rand =  [Math.floor(Math.random() * (20)), Math.floor(Math.random() * (20))];
    //rand =  [width/2 - 3 + Math.floor(Math.random() * (7)), width/2 - 3 + Math.floor(Math.random() * (7))];
    //rand =  [width/2, width/2 - 2];
    for(var k = 0; k < positionsOfSnake.length; k++)
    {
        if(positionsOfSnake[k][0]*width + positionsOfSnake[k][1] == rand[0]*width + rand[1])
            rand =  [Math.floor(Math.random() * (20)), Math.floor(Math.random() * (20))];
            //rand =  [width/2 - 3 + Math.floor(Math.random() * (7)), width/2 - 3 + Math.floor(Math.random() * (7))];
    }
    for(var k = 0; k < positionOfFood.length; k++)
    {
        if(positionOfFood[k][0]*width + positionOfFood[k][1] == rand[0]*width + rand[1])
            rand =  [Math.floor(Math.random() * (20)), Math.floor(Math.random() * (20))];
            //rand =  [width/2 - 3 + Math.floor(Math.random() * (7)), width/2 - 3 + Math.floor(Math.random() * (7))];
    }
    squares[rand[0]*width + rand[1]].classList.add('cellFood');
    squares[rand[0]*width + rand[1]].style.backgroundColor = color;
    return rand;
}
function drawPosition([i, j], width, squares, color) 
{
    squares[i*width + j].classList.add('cellSnake');
    squares[i*width + j].style.backgroundColor = color;
}
function draw(positionsOfSnake, width, squares, color)
{
    for(var k=0; k<positionsOfSnake.length; k++)
        drawPosition(positionsOfSnake[k], width, squares, color);
}
function undraw(positionsOfSnake, width, squares, color)
{
    for(var k=0; k<positionsOfSnake.length; k++)
        undrawPosition(positionsOfSnake[k], width, squares);
}
function undrawPosition([i, j], width, squares) 
{
    squares[i*width + j].classList.remove('cellSnake');
    //squares[i*width + j].style.borderWidth = 0;

    if(i % 2 == 0 && j % 2 == 0)
        squares[i*width + j].style.backgroundColor = '#203354';
    if(i % 2 == 0 && j % 2 == 1)
        squares[i*width + j].style.backgroundColor = '#273445';
    if(i % 2 == 1 && j % 2 == 1)
        squares[i*width + j].style.backgroundColor = '#203354';
    if(i % 2 == 1 && j % 2 == 0)
        squares[i*width + j].style.backgroundColor = '#273445';
    
}
function checkCollision(positionsOfSnake, width)
{
    for(var k=1; k <positionsOfSnake.length; k++)
        if(positionsOfSnake[0][0]*width + positionsOfSnake[0][1] == positionsOfSnake[k][0]*width + positionsOfSnake[k][1])
            return true;
    return false;
}
function clearBoard()
{
    var squares = Array.from(document.querySelectorAll('.grid div'));
    for(var k=0; k<20; k++)
        for(var l=0; l<20; l++)
            undrawPosition([k, l], 20, squares);        
}
function createBoard(n)
{
    var toAdd = document.getElementById('grid');
    var l = 0;
    var newDiv;
    for(var k=0; k<n/2; k++)
    {
        if(k % 10 == 0 && k > 0)
            l++;
 
        if(l % 2 == 0)
        {
            newDiv = document.createElement('div');
            newDiv.className = "cell1"
            toAdd.appendChild(newDiv);

            newDiv = document.createElement('div');
            newDiv.className = "cell2"
            toAdd.appendChild(newDiv);
        }
        else
        {
            newDiv = document.createElement('div');
            newDiv.className = "cell2"
            toAdd.appendChild(newDiv);

            newDiv = document.createElement('div');
            newDiv.className = "cell1"
            toAdd.appendChild(newDiv);
        }
    }
    
}
function eatFood(positionOfTail, positionsOfSnake, positionOfFood, squares, width, color)
{
    for(var k=0; k<positionOfFood.length; k++)
        if(positionOfTail[0]*width + positionOfTail[1] == positionOfFood[k][0]*width + positionOfFood[k][1])
        {   
            positionsOfSnake[positionsOfSnake.length] = positionOfFood[k];
            squares[positionOfFood[k][0]*width + positionOfFood[k][1]].classList.remove('cellFood');
            positionOfFood[k] = renderFood(positionsOfSnake, positionOfFood, width, squares, color);
            return [true, positionOfFood];
        }
    return [false, positionOfFood];
}
function moveLeft(squares, positionsOfSnake, positionOfFood, width, color) 
{
    var res = false;
    if(checkCollision(positionsOfSnake, width) || positionsOfSnake[0][1] == 0)
        return [res, true, positionOfFood];
    
    ret = eatFood(positionsOfSnake[positionsOfSnake.length - 1], positionsOfSnake, positionOfFood, squares, width, color);
    positionOfFood = ret[1];
    if(ret[0])
        res = true; 

    undraw(positionsOfSnake, width, squares);
    if(positionsOfSnake.length > 1)
        for(var k=positionsOfSnake.length - 1;k>=1; k--)
            positionsOfSnake[k] = positionsOfSnake[k - 1];
    positionsOfSnake[0] = [positionsOfSnake[0][0], positionsOfSnake[0][1] - 1];
    draw(positionsOfSnake, width, squares, color);

    return [res, false, positionOfFood];
}
function moveRight(squares, positionsOfSnake, positionOfFood, width, color) 
{
    var res = false;
    if(checkCollision(positionsOfSnake, width) || positionsOfSnake[0][1] == width - 1)
        return [res, true, positionOfFood];

    ret = eatFood(positionsOfSnake[positionsOfSnake.length - 1], positionsOfSnake, positionOfFood, squares, width, color);
    positionOfFood = ret[1];
    if(ret[0])
        res = true; 

    undraw(positionsOfSnake, width, squares);
    if(positionsOfSnake.length > 1)
        for(var k=positionsOfSnake.length - 1;k>=1; k--)
            positionsOfSnake[k] = positionsOfSnake[k - 1];
    positionsOfSnake[0] = [positionsOfSnake[0][0], positionsOfSnake[0][1] + 1];
    draw(positionsOfSnake, width, squares, color);

    return [res, false, positionOfFood];
}
function moveDown(squares, positionsOfSnake, positionOfFood, width, color) 
{
    var res = false;
    if(checkCollision(positionsOfSnake, width) || positionsOfSnake[0][0] == width - 1)
        return [res, true, positionOfFood];

    ret = eatFood(positionsOfSnake[positionsOfSnake.length - 1], positionsOfSnake, positionOfFood, squares, width, color);
    positionOfFood = ret[1];
    if(ret[0])
        res = true; 

    undraw(positionsOfSnake, width, squares);
    if(positionsOfSnake.length > 1)
        for(var k=positionsOfSnake.length - 1;k>=1; k--)
            positionsOfSnake[k] = positionsOfSnake[k - 1];
    positionsOfSnake[0] = [positionsOfSnake[0][0] + 1, positionsOfSnake[0][1]];
    draw(positionsOfSnake, width, squares, color);

    return [res, false, positionOfFood];
}
function moveUp(squares, positionsOfSnake, positionOfFood, width, color) 
{
    var res = false;
    if(checkCollision(positionsOfSnake, width) || positionsOfSnake[0][0] == 0)
        return [res, true, positionOfFood];

    ret = eatFood(positionsOfSnake[positionsOfSnake.length - 1], positionsOfSnake, positionOfFood, squares, width, color);
    positionOfFood = ret[1];
    if(ret[0])
        res = true; 

    undraw(positionsOfSnake, width, squares);
    if(positionsOfSnake.length > 1)
        for(var k=positionsOfSnake.length - 1;k>=1; k--)
            positionsOfSnake[k] = positionsOfSnake[k - 1];
    positionsOfSnake[0] = [positionsOfSnake[0][0] - 1, positionsOfSnake[0][1]];
    draw(positionsOfSnake, width, squares, color);

    return [res, false, positionOfFood];
}

function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playGame(numberOfMaxMoves, currentPopulation, color, delay)
{
    const width = 20;
    var squares = Array.from(document.querySelectorAll('.grid div'));
    var score = 0;
    var direction;
    var positionsOfSnake = new Array();
    // positionsOfSnake[0] = [Math.floor(Math.random()*20), Math.floor(Math.random()*20)]
    positionsOfSnake[0] = [width/2, width/2];
    var positionOfFood = []

    numberOfFood = 1;
    for(var k=0; k<numberOfFood; k++)
        positionOfFood[k] = renderFood(positionsOfSnake, positionOfFood, width, squares, color);
    var count = new Array(10);
    for(var k=0; k<count.length; k++)
        count[k] = 0;
    var prevPositions = [];
    var prevDistance, distance;
    var flag = false;
    var scoreToRender = 0;
    var text = document.getElementById("ScoreText").textContent = 'Score: ' + scoreToRender;
    prevPosition = positionsOfSnake[0];
    delay = 10;
    draw(positionsOfSnake, width, squares, color);
    for(var k=0; k<numberOfMaxMoves; k++)
    {
        
        prevPositions.push(positionsOfSnake[0]);
        //Only for one food
        prevDistance = Math.sqrt((positionsOfSnake[0][0] - positionOfFood[0][0])*(positionsOfSnake[0][0] - positionOfFood[0][0]) + (positionsOfSnake[0][1] - positionOfFood[0][1])*(positionsOfSnake[0][1] - positionOfFood[0][1]));
        direction = getMove(currentPopulation, windowSize, positionsOfSnake, positionOfFood, prevPosition);
        await sleep(delay);
        // if(Math.random() < 0.1)
            //  direction = Math.floor(Math.random()*4);
        prevPosition = positionsOfSnake[0];
        if(direction == 0)
            results = moveLeft(squares, positionsOfSnake, positionOfFood, width, color);
        if(direction == 1)
            results = moveUp(squares, positionsOfSnake, positionOfFood, width, color);
        if(direction == 2)
            results = moveRight(squares, positionsOfSnake, positionOfFood, width, color);
        if(direction == 3)
            results = moveDown(squares, positionsOfSnake, positionOfFood, width, color);
        positionOfFood = results[2];
        
        if(results[1])
        {
            score -= 50;
            break;
        }
        // score += 100;
        if(results[0])
        {
            score += 500;
            scoreToRender += 1;
            var text = document.getElementById("ScoreText").textContent = 'Score: ' + scoreToRender;
        }
        distance = Math.sqrt((positionsOfSnake[0][0] - positionOfFood[0][0])*(positionsOfSnake[0][0] - positionOfFood[0][0]) + (positionsOfSnake[0][1] - positionOfFood[0][1])*(positionsOfSnake[0][1] - positionOfFood[0][1]));
        //console.log(distance, prevDistance)
        if(distance <= prevDistance)
            score += 5;
        else
            score -= -0.5;

        for(var t=0; t<count.length; t++)
            if(prevPositions.length > t + 1)
                if(prevPositions[prevPositions.length - (t + 2)][0] == positionsOfSnake[0][0] && prevPositions[prevPositions.length - (t + 2)][1] == positionsOfSnake[0][1])
                    count[t]++;
                else
                    count[t] = 0;

        for(var t=0; t<count.length; t++)
            if(count[t] >= 5)
            {
                score -= 50;
                flag = true;
            }
        if(flag)
            break;
    }
    if(positionsOfSnake.length < 2)
         score -= 50;
    return [score, scoreToRender];
}

async function oneGeneration(populationSize, populations, windowSize, hiddenSize, numberOfMaxMoves, colors, maxScore, delay, top25Populations, top25Scores)
{
    var scores = [];
    for(var k=0; k<populationSize; k++)
        scores[k] = 0;
    var score = 0;
    var k;
    for(k=0; k<populationSize; k++)
    {
        var text = document.getElementById("PopulationText").textContent = 'Population: ' + k;
        scoresReturned = await playGame(numberOfMaxMoves, populations[k], colors[k], delay);
        scores[k] += scoresReturned[0];
        if(scoresReturned[1] > maxScore)
        {
            var text = document.getElementById("MaxScoreText").textContent = 'Max score: ' + scoresReturned[1];
            maxScore = scoresReturned[1];
        }
        clearBoard();
    }
    indexes = [];
    for(k=0;k<populationSize; k++)
        indexes[k] = k;
    indexes.sort(function (a, b) { return scores[a] < scores[b] ? 1 : scores[a] > scores[b] ? -1 : 0; });
    scores.sort(function (a, b) { return b - a; });
    var populationToReturn = [];
    var scoresToReturn = [];
    for(k=0; k<populationSize/4; k++)
    {
        populationToReturn[k] = populations[indexes[k]];
        scoresToReturn[k] = scores[k];
    }
    results = reproduce(populationToReturn, scoresToReturn, windowSize, hiddenSize, top25Populations, top25Scores);
    newPopulation = results[0];
    top25Populations = results[1];
    top25Scores = results[2];

    return [newPopulation, maxScore, top25Populations, top25Scores];
}

async function evolve(populationSize, populations, windowSize, hiddenSize, numberOfMaxMoves, numberOfGenerations, colors, maxScore, top25Populations, top25Scores)
{
    for(var k=0; k<numberOfGenerations; k++)
    {
        console.log('Generation: ', k);
        var text = document.getElementById("GenerationText").textContent = 'Generation: ' + k;
        if(k > 50)
            delay = 20;
        else
            delay = 20;
        results = await oneGeneration(populationSize, populations, windowSize, hiddenSize, numberOfMaxMoves, colors, maxScore, delay, top25Populations, top25Scores);
        populations = results[0];
        maxScore = results[1];
        top25Populations = results[2];
        top25Scores = results[3];
        clearBoard();
    }
}
function getRandomColor() 
{
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var k = 0; k < 6; k++) 
      color += letters[Math.floor(Math.random() * 16)];
    
    return color;
}

var populationSize = 60;
var numberOfGenerations = 1000;
var numberOfMaxMoves = 1000;
var windowSize = 9*9;
var hiddenSize = 25;
var boardSize = 20;
var colors = [];
var maxScore = -10000;
var populations = [];
var top25Populations = [];
var top25Scores = [];
createBoard(400);
var text = document.getElementById("InputText").textContent = 'Input Layer: ' + windowSize;
var text = document.getElementById("HiddenText").textContent = 'Hidden Layer: ' + hiddenSize;
for(var k = 0; k < populationSize; k++)
{
    populations[k] = generateBrain(windowSize, hiddenSize, 4);
    colors[k] = getRandomColor();
}
console.log(populations)
evolve(populationSize, populations, windowSize, hiddenSize, numberOfMaxMoves, numberOfGenerations, colors, maxScore, top25Populations, top25Scores);