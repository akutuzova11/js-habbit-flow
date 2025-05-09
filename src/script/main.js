"use strict";

let habits = [];
const HABIT_KEY = "HABIT_KEY";
let globalActiveHabitId;

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__coverBar"),
  },
  content: {
    daysContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habit__day"),
    form: document.querySelector(".habit__form"),
    habitListContainer: document.getElementById("habit-list"),
  },
  popup: {
    index: document.getElementById("add-habit-popup"),
    iconField: document.querySelector(".popup__form input[name='icon']"),
    addHabitForm: document.querySelector(".popup__form"),
  },
};

function loadData() {
  const habitsString = localStorage.getItem(HABIT_KEY);
  const habitsArray = JSON.parse(habitsString);
  habits = Array.isArray(habitsArray) ? habitsArray : [];
}

function saveData() {
  localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

function togglePopup() {
  if (page.popup.index.classList.contains("cover_hidden")) {
    page.popup.index.classList.remove("cover_hidden");
  } else {
    page.popup.index.classList.add("cover_hidden");
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
    form[field].classList.remove("error");
  }
}

function validateForm(form, fields) {
  const formData = new FormData(form);
  const res = {};
  let isValid = true;
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
      isValid = false;
    }
    res[field] = fieldValue;
  }

  if (!isValid) {
    return;
  }
  return res;
}

function rerenderMenu(activeHabit) {
  page.menu.innerHTML = "";
  for (const habit of habits) {
    const element = document.createElement("button");
    element.setAttribute("menu-habit-id", habit.id);
    element.classList.add("menu__item");
    element.innerHTML = ` <img src="./src/assets/${habit.icon}.svg" alt="${habit.name}" >`;

    if (activeHabit.id === habit.id) {
      element.classList.add("menu__item--active");
    }

    element.addEventListener("click", () => rerender(habit.id));
    page.menu.prepend(element);
  }
}

function rerenderHead(activeHabit) {
  page.header.h1.innerText = activeHabit.name;
  const progress =
    activeHabit.days.length / activeHabit.target > 1
      ? 100
      : (activeHabit.days.length / activeHabit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.style.width = `${progress}%`;

  const deleteButton = document.querySelector(".habit__delete");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => deleteHabit(activeHabit.id));
  }
}

function deleteDay(index) {
  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      habit.days.splice(index, 1);
      return {
        ...habit,
        days: habit.days,
      };
    }
    return habit;
  });
  saveData();
  rerender(globalActiveHabitId);
}

function rerenderContent(activeHabit) {
  page.content.daysContainer.innerHTML = "";

  activeHabit.days.forEach((day, index) => {
    const element = document.createElement("div");
    element.classList.add("habit");

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("habit__day");
    dayDiv.textContent = `Day ${index + 1}`;

    const commentContainer = document.createElement("div");
    commentContainer.classList.add("habit__comment-container");

    const commentDiv = document.createElement("div");
    commentDiv.classList.add("habit__comment-text");
    commentDiv.textContent = day.comment;
    commentContainer.appendChild(commentDiv);

    if (day.comment) {
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("day__delete");
      deleteButton.addEventListener("click", () => deleteDay(index));
      const deleteImg = document.createElement("img");
      deleteImg.src = "./src/assets/delete.svg";
      deleteImg.alt = `Delete day ${index + 1}`;
      deleteButton.appendChild(deleteImg);
      commentContainer.appendChild(deleteButton);
    }

    element.appendChild(dayDiv);
    element.appendChild(commentContainer);

    page.content.daysContainer.appendChild(element);
  });

  page.content.nextDay.innerHTML = `Day ${activeHabit.days.length + 1}`;
}

function rerender(activeHabitId) {
  globalActiveHabitId = activeHabitId;
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);
  if (!activeHabit) {
    return;
  }
  document.location.replace(document.location.pathname + "#" + activeHabitId);
  rerenderMenu(activeHabit);
  rerenderHead(activeHabit);
  rerenderContent(activeHabit);
}

function addDays(event) {
  event.preventDefault();

  const data = validateForm(event.target, ["comment"]);
  if (!data) {
    return;
  }

  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      return {
        ...habit,
        days: habit.days.concat([{ comment: data.comment }]),
      };
    }
    return habit;
  });
  saveData();
  rerender(globalActiveHabitId);
  resetForm(event.target, ["comment"]);
}

function addHabit(event) {
  event.preventDefault(); // Prevent the default form submission
  console.log("addHabit function called"); // Add this console log
  const data = validateForm(event.target, ["name", "icon", "target"]);
  if (!data) {
    console.log("Form validation failed");
    return;
  }
  const maxId = habits.reduce(
    (acc, habit) => (acc > habit.id ? acc : habit.id),
    0
  );
  const newHabit = {
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  };
  habits.push(newHabit);
  saveData();
  rerender(newHabit.id);
  resetForm(event.target, ["name", "target"]);
  togglePopup();
}

page.header.h1.addEventListener("click", () => {});
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".icon.icon_active");
  activeIcon.classList.remove("icon_active");
  context.classList.add("icon_active");
}

function deleteHabit(habitId) {
  habits = habits.filter((habit) => habit.id !== habitId);
  saveData();

  if (globalActiveHabitId === habitId) {
    globalActiveHabitId = null;
    document.location.hash = "";
    page.header.h1.innerText = "-";
    page.header.progressPercent.innerText = "0%";
    page.header.progressCoverBar.style.width = "0%";
    page.content.daysContainer.innerHTML = "";
    if (habits.length > 0) {
      rerender(habits[0].id);
    } else {
      rerenderMenu({});
      page.content.nextDay.innerText = "";
    }
  } else {
    rerenderMenu(habits.find((h) => h.id === globalActiveHabitId) || {});
  }
  rerenderContent(habits.find((h) => h.id === globalActiveHabitId) || {});
}

(() => {
  loadData();
  function initializeHabitFlow() {
    if (habits.length > 0) {
      const hashId = Number(document.location.hash.replace("#", ""));
      const urlHabit = habits.find((habit) => habit.id === hashId);
      if (urlHabit) {
        rerender(urlHabit.id);
      } else {
        rerender(habits[0]?.id);
      }
    }
  }
  initializeHabitFlow();
  page.content.form.addEventListener("submit", addDays);
  page.popup.addHabitForm.addEventListener("submit", addHabit);

  const addHabitButton = document.querySelector(".menu__add");
  addHabitButton.addEventListener("click", togglePopup);

  const iconButtons = document.querySelectorAll(".icon");
  iconButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const iconName = this.querySelector("img")
        .getAttribute("alt")
        .toLowerCase();
      setIcon(this, iconName);
    });
  });

  const closePopupButton = document.querySelector(".popup__close");
  closePopupButton.addEventListener("click", togglePopup);

  const daysContainer = document.getElementById("days");
  daysContainer.addEventListener("click", function (event) {
    if (event.target.closest(".habit__delete")) {
      const habitItem = event.target.closest(".habit");
      if (habitItem) {
        const habitIdToDelete = Number(habitItem.dataset.habitId);
        deleteHabit(habitIdToDelete);
      }
    }
  });
})();
