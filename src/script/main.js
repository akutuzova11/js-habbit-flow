"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__coverBar"),
  },
  content: {
    daysContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habbit__day"),
  },
};

function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitsArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitsArray)) {
    habbits = habbitsArray;
  } else {
    habbits = [];
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = ` <img src="./src/assets/${habbit.icon}.svg" alt="${habbit.name}" >`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item--active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item--active");
    } else {
      existed.classList.remove("menu__item--active");
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = "";
  for (const index in activeHabbit.days) {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.innerHTML = `<div class="habbit__day"> Day ${
      Number(index) + 1
    }</div>
    <div class="habbit_comment">${activeHabbit.days[index].comment}</div>
    <button class="habbit__delete" onclick="deleteDay(${index})">
    <img src="./src/assets/delete.svg" alt="Delete day ${index + 1}" />
    </button>`;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `Day ${activeHabbit.days.length + 1}
    `;
}

function rerender(activeHabbitId) {
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

(() => {
  loadData();
  if (habbits.length > 0) {
    rerender(habbits[0].id);
  }
})();
