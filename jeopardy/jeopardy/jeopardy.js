// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
$('body').append('<h1>Jeopardy!</h1>'); // Add a title to the page
$('body').append('<button id="start">Start Game</button>'); // Add a button to the page
$('body').append('<table id="jeopardy"><thead></thead><tbody></tbody></table>'); // Add a table to the page
$('#jeopardy thead').append('<tr></tr>'); // Add a row to the table head
for (let i = 0; i < 6; i++) { // Add a cell to the row for each category
  $('#jeopardy thead tr').append(`<td id="category${i}"></td>`);
}
for (let i = 0; i < 5; i++) { // Add a row to the table body for each question
  $('#jeopardy tbody').append('<tr></tr>');
  for (let j = 0; j < 6; j++) { // Add a cell to the row for each category
    $('#jeopardy tbody tr:last-child').append(`<td id="cell${i}-${j}">?</td>`);
  }
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
  const categoryIds = [];
  const ids = [2,3,4,6,8,9,10,11,12,13,14,15,17,18]

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ids.length);
    categoryIds.push(ids[randomIndex]);
    ids.splice(randomIndex, 1);
  }

  return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {
  return $.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  for (let category of categories) {
    for (let clue of category.clues) {
      clue.showing = null;
    }
  }

  const categoryIds = getCategoryIds();
  for (let i = 0; i < 6; i++) {
    const category = await getCategory(categoryIds[i]);
    categories.push(category);
    $(`#category${i}`).text(category.title);
    for (let j = 0; j < 5; j++) {
      $(`#cell${j}-${i}`).text('?');
    }
  }
  
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const cell = evt.target;
  const [row, col] = cell.id.split('cell')[1].split('-');
  const clue = categories[col].clues[row];
  if (clue.showing === 'answer') return;
  if (clue.showing === 'question') {
    $(cell).text(clue.answer);
    clue.showing = 'answer';
  } else {
    $(cell).text(clue.question);
    clue.showing = 'question';
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#start").text("Loading...");
  $('#jeopardy').hide();
  $('#jeopardy tbody td').off('click');
  $('#jeopardy tbody td').text('?');
  $('#jeopardy thead td').text('');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $('#start').text('Restart');
  $('#loading').remove();
  $('#jeopardy').show();
  $('#jeopardy tbody td').on('click', handleClick);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();
  await fillTable();
  hideLoadingView();
}

/** On click of start / restart button, set up game. */

// TODO
$('#start').on('click', async function() { // Add a click handler to the start button
  $('#jeopardy').show(); // Show the table
  $('#jeopardy tbody td').on('click', handleClick); // Add a click handler to each cell
  await setupAndStart(); // Start the game
  $('#start').id('restart');
});

$('#restart').on('click', async function (){
  $('#jeopardy tbody td').on('click', handleClick); // Add a click handler to each cell
  await setupAndStart(); // Start the game
});

function isGameOver() {
  for (let category of categories) {
    for (let clue of category.clues) {
      if (clue.showing !== "answer") {
        return false;
      }
    }
  }
  return true;
}
