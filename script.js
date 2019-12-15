/*
/ To-do list
/ - game instruction
/ - save pic
/ - refactor to support dynamic cols and rows
/ - remove radio buttons?
/ - use gif
/ - pic upload
/ - timer
*/

"use strict";

let allPicList;
let moveCount = 0;
setNewPic();

function setNewPic() {
  if (allPicList) {
    pickNewPic(allPicList);
  } else {
    $.getJSON("https://picsum.photos/list", function(data) {
      console.log("success getting list: length = ", data.length);
      allPicList = data;
      pickNewPic(allPicList);
    });
  }
}

function pickNewPic(data) {
  let item = data[Math.floor(Math.random() * data.length)];
  console.log(item);
  $.getJSON(`https://picsum.photos/id/${item.id}/info`, function(data) {
    console.log(data);
    const frameWidth = Math.floor($("#images-frame").width());
    const frameHeight = Math.floor($("#images-frame").height());
    let url = `url("https://picsum.photos/id/${data.id}/${frameWidth}/${frameHeight}")`;
    // const url = `url("https://picsum.photos/id/918/${frameWidth}/${frameHeight}")`;
    // const url = `url("https://picsum.photos/id/918/500/500")`;
    console.log(url);
    $(".p").css("background-image", url);
  });
}

// startGrid = [['p2', 'p3', 'blank'], ['p1', 'p4', 'p5'], ['p6', 'p7', 'p8']]
// startGrid = [['p1', 'p2', 'p3'], ['p4', 'p5', 'p6'], ['p7', 'blank', 'p8']]
const winGrid = [["p1", "p2", "p3"], ["p4", "p5", "p6"], ["p7", "p8", "blank"]];
let startGrid = $.extend(true, [], winGrid);

startGame();

function setPositionsWithStartGrid() {
  $(".p").css("transition", "transform 0s");
  for (let i = 0; i < startGrid.length; i++) {
    for (let j = 0; j < startGrid[i].length; j++) {
      let thisPiece = $("#" + startGrid[i][j]);
      // console.log(thisPiece);
      let x = j;
      let y = i;
      thisPiece.attr("data-col", x);
      thisPiece.attr("data-row", y);
      thisPiece.data("col", x);
      thisPiece.data("row", y);
      translateToPosition(thisPiece);
    }
  }
  $(".p").css("transition", "transform 0.5s");
}

setHandlers();

function setHandlers() {
  $("#buttons-frame").on("touchmove", handleTouchMove);

  for (let i = 1; i <= 9; i++) {
    $("#b" + i + " > input").change(handleChange);
    $("#b" + i).css("grid-area", "s" + i);
    $("#b" + i).on("touchstart", handleTouchStart);
  }
}

let xDown = null;
let yDown = null;
let sDown = null;
let expectedMove = null;

function handleTouchStart(evt) {
  console.log($(this));
  const touchedRow = $(this).data("row");
  const touchedCol = $(this).data("col");

  const blankRow = $("#blank").data("row");
  const blankCol = $("#blank").data("col");

  // console.log(touchedRow, touchedCol, blankRow, blankCol);

  if ((touchedRow === blankRow) ^ (touchedCol === blankCol)) {
    sDown = this;
    console.log("xor");
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
    console.log("xDown", xDown);
    console.log("yDown", yDown);
    $("#xd").text(Math.floor(xDown));
    $("#yd").text(Math.floor(yDown));
    if (touchedRow === blankRow) {
      // horizontal move
      if (touchedCol > blankCol) {
        expectedMove = "l";
      } else {
        expectedMove = "r";
      }
    } else {
      // vertical move
      if (touchedRow > blankRow) {
        expectedMove = "u";
      } else {
        expectedMove = "d";
      }
    }
  } else {
    sDown = null;
    expectedMove = null;
    console.log("xnor");
  }
}

function handleTouchMove(evt) {
  // if (!xDown || !yDown) {
  if (!expectedMove) {
    return;
  }
  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;
  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  $("#xu").text(Math.floor(xUp));
  $("#yu").text(Math.floor(yUp));
  $("#xt").text(Math.floor(xDiff));
  $("#yt").text(Math.floor(yDiff));
  // console.log("xUp", xUp);
  // console.log("yUp", yUp);
  // console.log("xDiff", xDiff);
  // console.log("yDiff", yDiff);

  const touchedRow = $(sDown).data("row");
  const touchedCol = $(sDown).data("col");

  const blankRow = $("#blank").data("row");
  const blankCol = $("#blank").data("col");

  // console.log(touchedRow, touchedCol, blankRow, blankCol);

  let isMoveAllowed = false;
  if (expectedMove === "u" && yDiff > 0) {
    isMoveAllowed = true;
  } else if (expectedMove === "d" && yDiff < 0) {
    isMoveAllowed = true;
  } else if (expectedMove === "l" && xDiff > 0) {
    isMoveAllowed = true;
  } else if (expectedMove === "r" && xDiff < 0) {
    isMoveAllowed = true;
  } else {
  }
  // console.log("expectedMove", expectedMove);
  // console.log("isMoveAllowed", isMoveAllowed);
  if (isMoveAllowed)
    $(sDown)
      .children(":first")
      .prop("checked", true)
      .trigger("change");

  /* reset values */
  xDown = null;
  yDown = null;
  sDown = null;
  expectedMove = null;
}

function handleChange(e) {
  let clickedRow = $(this)
    .parent()
    .data("row");
  let clickedCol = $(this)
    .parent()
    .data("col");
  let blankRow = $("#blank").data("row");
  let blankCol = $("#blank").data("col");

  // console.log(clickedRow);
  // console.log(clickedCol);
  // console.log(blankRow);
  // console.log(blankCol);
  let times; // how many squares to move?
  let direction; // which direction to move?
  if (clickedRow === blankRow) {
    // vertical move
    times = Math.abs(clickedCol - blankCol);
    if (clickedCol > blankCol) {
      // console.log("clicked piece is on the right, need to move left");
      direction = "l";
    } else {
      // console.log("clicked piece is on the left, need to move right");
      direction = "r";
    }
  } else {
    // horizontal move
    times = Math.abs(clickedRow - blankRow);
    if (clickedRow > blankRow) {
      // console.log("clicked piece is under, need to move up");
      direction = "u";
    } else {
      // console.log("click piece is above, need to move down");
      direction = "d";
    }
  }
  for (let i = 0; i < times; i++) {
    move(direction);
  }
  if (!checkWinning()) {
    setActiveButtons();
  }
}

function setActiveButtons() {
  let selectedOption = $("input:radio[name=s]:checked").val();
  let currentRow = $("#" + selectedOption).data("row");
  let currentCol = $("#" + selectedOption).data("col");
  for (let i = 1; i <= 9; i++) {
    let thisRow = $(`#b${i}`).data("row");
    let thisCol = $(`#b${i}`).data("col");
    let thisButton = $(`#b${i} > input`);
    if (thisRow !== currentRow && thisCol !== currentCol) {
      thisButton.attr("disabled", true);
    } else {
      thisButton.attr("disabled", false);
    }
  }
}

function setBlankChecked() {
  let blank = $("#blank");
  let blankCol = blank.data("col");
  let blankRow = blank.data("row");
  let blankRadio = $(`.item[data-col=${blankCol}]`)
    .filter(`.item[data-row=${blankRow}]`)
    .children()
    .first();
  blankRadio.prop("checked", true);
}

function move(direction) {
  moveCount++;
  if ($("#showMoveCount").is(":checked")) {
    $("#moveCount span").text(moveCount);
  }
  console.log(moveCount);
  const availableMoves = ["u", "d", "l", "r"];
  if (availableMoves.includes(direction)) {
    let blank = $("#blank");
    let blankCol = blank.data("col");
    let blankRow = blank.data("row");
    let targetCol = blankCol; // where the moving piece will go
    let targetRow = blankRow; // where the moving piece will go
    if (direction === "u") {
      blankRow++;
    } else if (direction === "d") {
      blankRow--;
    } else if (direction === "l") {
      blankCol++;
    } else {
      // direction === 'r'
      blankCol--;
    }
    let movingPiece = $(`.p[data-col=${blankCol}]`).filter(
      `.p[data-row=${blankRow}]`
    );
    movingPiece.data("col", targetCol);
    movingPiece.attr("data-col", targetCol);
    movingPiece.data("row", targetRow);
    movingPiece.attr("data-row", targetRow);
    blank.data("col", blankCol);
    blank.attr("data-col", blankCol);
    blank.data("row", blankRow);
    blank.attr("data-row", blankRow);
    translateToPosition(movingPiece);
    translateToPosition(blank);
  } else {
    // direction is not in ['u', 'd', 'l', 'r']
    alert("Wrong direction: " + direction);
  }
}

function translateToPosition(piece) {
  piece.css(
    "transform",
    `translate(${piece.data("col") * 100}%, ${piece.data("row") * 100}%)`
  );
}

function checkWinning() {
  let currentGrid = [];
  for (let i = 0; i < 3; i++) {
    let row = [];
    for (let j = 0; j < 3; j++) {
      let thisPiece = $(`.p[data-col=${j}]`).filter(`.p[data-row=${i}]`);
      row.push(thisPiece.prop("id"));
    }
    currentGrid.push(row);
  }
  // console.log(currentGrid);
  // console.log(JSON.stringify(currentGrid) === JSON.stringify(winGrid));

  if (JSON.stringify(currentGrid) === JSON.stringify(winGrid)) {
    // player won!!!
    $("input[name=s]").attr("disabled", true);
    setTimeout(function() {
      alert(`You won! Total moves was ${moveCount}.`);
      $("#blank").css("opacity", "initial");
    }, 500);
    return true;
  } else {
    return false;
  }
}

function shuffleGrid(grid) {
  let previousBlank = [];
  for (let i = 0; i < 10; i++) {
    let swapCandidates = [];
    const [blankRow, blankCol] = getBlankRowCol(grid);
    if (blankCol > 0) {
      swapCandidates.push([blankRow, blankCol - 1]);
    }
    if (blankCol < 2) {
      swapCandidates.push([blankRow, blankCol + 1]);
    }
    if (blankRow > 0) {
      swapCandidates.push([blankRow - 1, blankCol]);
    }
    if (blankRow < 2) {
      swapCandidates.push([blankRow + 1, blankCol]);
    }
    // console.log("swapCandidates", swapCandidates.length, swapCandidates);
    // console.log("previousBlank", previousBlank.length, previousBlank);
    const previousBlankIndex = swapCandidates.findIndex(
      item => JSON.stringify(item) === JSON.stringify(previousBlank)
    );
    // console.log("previousBlankIndex", previousBlankIndex);
    if (previousBlankIndex !== -1) {
      swapCandidates.splice(previousBlankIndex, 1);
    }

    // console.log(
    //   "swapCandidates after splice",
    //   swapCandidates.length,
    //   swapCandidates
    // );

    const picked =
      swapCandidates[Math.floor(Math.random() * swapCandidates.length)];
    // console.log("picked", picked);
    [grid[picked[0]][picked[1]], grid[blankRow][blankCol]] = [
      grid[blankRow][blankCol],
      grid[picked[0]][picked[1]]
    ];
    previousBlank = [blankRow, blankCol];
  }
  // console.log(grid);
}

function getBlankRowCol(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === "blank") return [i, j];
    }
  }
  alert("no blank");
}

function refresh() {
  if (window.confirm("Restart the game?")) {
    console.log("restart!");
    startGame(false);
  }
}

function newPic() {
  if (window.confirm("Change to a new picture?")) {
    setNewPic();
    startGame();
  }
}

function startGame(shuffle = true) {
  $("#blank").css("opacity", 0);
  if (shuffle) shuffleGrid(startGrid);
  setPositionsWithStartGrid();
  setBlankChecked();
  setActiveButtons();
  moveCount = 0;
  const show = $("#showMoveCount")[0].checked;
  if (show) {
    $("#moveCount span").text(moveCount);
  }
}

function toggleMoveCount(e) {
  const show = e.checked;
  if (show) {
    $("#moveCount span").text(moveCount);
  } else {
    $("#moveCount span").text("#");
  }
}
