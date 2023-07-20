const toolBtns = document.querySelectorAll(".tool"),//инструменты
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    alphaSlider = document.querySelector("#alpha-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img");

const canvas = document.getElementById('canvas'),//холсты
    draw = document.getElementById('draw');
const canvas_ctx = canvas.getContext('2d'),//контексты
    draw_ctx = draw.getContext('2d');
window.addEventListener('keydown', this.check, false);//клавиши

let snapShot, lastPoint, currentPoint,//переменные
    isIdle = true,//ключ
    selectedTool = "brush",//инструмент
    brushWhidth = 10,//размер кисти
    brushAlpha = 1,//прозрачность кисти
    brushShape = "round",//форма кисти
    selectedColor = "black",//выбранный цвет
    backgroundColor = "white";//цвет задника

var cPushArray = [];
var cStep = -1,
    cLimit = 50;

//Размер холста
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw.width = draw.offsetWidth;
    draw.height = draw.offsetHeight;
    setCanvasBackground();

});

//Цвет холста
function setCanvasBackground() {
    canvas_ctx.fillStyle = backgroundColor;
    canvas_ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas_ctx.fillStyle = selectedColor;
    cPushArray = [];
    cStep = -1;
    cPush();
}

sizeSlider.addEventListener("change", () => brushWhidth = sizeSlider.value);//слайдер толщины

alphaSlider.addEventListener("change", () => brushAlpha = alphaSlider.value);//слайдер прозрачности

//Выбор цвета
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

//Пипетка
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

//Очистка холста
clearCanvas.addEventListener("click", () => {
    clear();
});

function clear() {
    canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
}

//Сохранение холста
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.png`
    link.href = canvas.toDataURL();
    link.click();
});

//Выбор инструментов
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

//Функции
function drawStart(e) {
    lastPoint = { x: e.clientX - draw.offsetLeft, y: e.clientY - draw.offsetTop };
    draw_ctx.strokeStyle = selectedColor;
    draw_ctx.fillStyle = selectedColor;
    draw_ctx.lineWidth = brushWhidth;
    draw_ctx.lineCap = brushShape;
    draw_ctx.lineJoin = brushShape;
    draw.style.opacity = brushAlpha;

    isIdle = false;
    snapShot = draw_ctx.getImageData(0, 0, draw.width, draw.height);
    drawMove(e);

}

function drawEnd() {
    if (isIdle) return;
    isIdle = true;
    canvas_ctx.globalAlpha = brushAlpha;
    canvas_ctx.drawImage(draw, 0, 0);
    draw_ctx.clearRect(0, 0, draw.width, draw.height);
    canvas_ctx.globalAlpha = 1;
    cPush();
}

function drawMove(e) {
    if (isIdle) return;
    currentPoint = { x: e.clientX - draw.offsetLeft, y: e.clientY - draw.offsetTop };

    if (selectedTool === "brush" || selectedTool === "eraser") {
        draw_ctx.strokeStyle = selectedTool === "eraser" ? backgroundColor : selectedColor;
        draw_ctx.beginPath();
        draw_ctx.moveTo(lastPoint.x, lastPoint.y);
        draw_ctx.lineTo(currentPoint.x, currentPoint.y);
        draw_ctx.stroke();
        lastPoint = currentPoint;
    } else if (selectedTool === "rectangle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        rectangle(e);
    } else if (selectedTool === "circle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        circle(e);
    } else if (selectedTool === "triangle") {
        draw_ctx.putImageData(snapShot, 0, 0);
        triangle(e);
    } else if (selectedTool === "line") {
        draw_ctx.putImageData(snapShot, 0, 0);
        line(e);
    }

}

function line() {
    draw_ctx.beginPath();
    draw_ctx.moveTo(lastPoint.x, lastPoint.y);
    draw_ctx.lineTo(currentPoint.x, currentPoint.y);
    draw_ctx.stroke();
}

function rectangle() {
    fillColor.checked ? draw_ctx.fillRect(
        lastPoint.x, lastPoint.y,
        currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y) :
        draw_ctx.strokeRect(
            lastPoint.x, lastPoint.y,
            currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
}

function circle() {
    draw_ctx.beginPath();
    let radius = Math.sqrt(Math.pow((currentPoint.x - lastPoint.x), 2) + Math.pow((currentPoint.y - lastPoint.y), 2));
    draw_ctx.arc(lastPoint.x, lastPoint.y, radius, 0, 2 * Math.PI);
    fillColor.checked ? draw_ctx.fill() : draw_ctx.stroke();
}

function triangle() {
    draw_ctx.beginPath();
    draw_ctx.moveTo(lastPoint.x, lastPoint.y);
    draw_ctx.lineTo(currentPoint.x, currentPoint.y);
    draw_ctx.lineTo(lastPoint.x * 2 - currentPoint.x, currentPoint.y);
    draw_ctx.closePath();
    fillColor.checked ? draw_ctx.fill() : draw_ctx.stroke();
}

function cPush() {
    cStep++;
    if (cStep < cPushArray.length) { cPushArray.length = cStep; }
    cPushArray.push(canvas.toDataURL());
    if (cStep > cLimit) {
        cStep = cLimit;
        cPushArray = cPushArray.slice(1);
    }

    console.log(cPushArray);
    console.log(cStep);

}


function cUndo() {
    if (0 < cStep) {
        cStep--;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { canvas_ctx.drawImage(canvasPic, 0, 0); }
    }
}

function cRedo() {
    if (cStep < cPushArray.length - 1) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { canvas_ctx.drawImage(canvasPic, 0, 0); }
    }
}

function check(e) {
    var code = e.keyCode;
    switch (code) {
        case 90: cUndo(); break;
        case 89: cRedo(); break;
        case 66: selectedTool = "brush"
            document.querySelector(".options .active").classList.remove("active");
            document.querySelector("#brush").classList.add("active"); break;
        case 69: selectedTool = "eraser"
            document.querySelector(".options .active").classList.remove("active");
            document.querySelector("#eraser").classList.add("active"); break;
        case 188: sizeSlider.value--;
            brushWhidth = sizeSlider.value; break;
        case 190: sizeSlider.value++;
            brushWhidth = sizeSlider.value; break;
        //default: console.log(code);
    }
}


function touchstart(e) { drawStart(e.touches[0]) }
function touchmove(e) { drawMove(e.touches[0]); e.preventDefault(); }
function touchend(e) { drawEnd(e.changedTouches[0]) }

draw.addEventListener('touchstart', touchstart, false);
draw.addEventListener('touchmove', touchmove, false);
draw.addEventListener('touchend', touchend, false);
draw.addEventListener('mousedown', drawStart, false);
draw.addEventListener('mousemove', drawMove, false);
draw.addEventListener('mouseup', drawEnd, false);