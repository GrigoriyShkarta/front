const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'messages');

const homeworkUk = {
  "title": "Домашні завдання",
  "subtitle": "Управління домашніми завданнями для ваших уроків.",
  "add_homework": "Додати завдання",
  "edit_homework": "Редагувати завдання",
  "delete_homework": "Видалити завдання",
  "bulk_delete": "Видалити вибрані ({count})",
  "empty_title": "Домашніх завдань не знайдено",
  "empty_description": "Ви ще не створили жодного завдання. Створіть перше завдання.",
  "table": {
    "name": "Назва завдання",
    "lesson": "Урок",
    "date": "Дата створення",
    "actions": "Дії"
  },
  "notifications": {
    "delete_success": "Завдання успішно видалено",
    "delete_error": "Не вдалося видалити завдання",
    "create_success": "Завдання успішно створено",
    "create_error": "Не вдалося створити завдання",
    "save_success": "Завдання успішно збережено",
    "save_error": "Не вдалося зберегти завдання"
  },
  "delete_confirm": {
    "title": "Підтвердження видалення",
    "description": "Ви впевнені, що хочете видалити це завдання? Цю дію неможливо скасувати.",
    "bulk_description": "Ви впевнені, що хочете видалити {count} вибраних завдань? Цю дію неможливо скасувати."
  },
  "form": {
    "name": "Назва завдання",
    "name_placeholder": "Введіть назву",
    "lesson": "Урок",
    "search_lesson": "Оберіть урок"
  }
};

const homeworkEn = {
  "title": "Homework",
  "subtitle": "Manage homework assignments for your lessons.",
  "add_homework": "Add homework",
  "edit_homework": "Edit homework",
  "delete_homework": "Delete homework",
  "bulk_delete": "Delete selected ({count})",
  "empty_title": "No homework found",
  "empty_description": "You haven't created any homework yet. Create your first assignment.",
  "table": {
    "name": "Title",
    "lesson": "Lesson",
    "date": "Created Date",
    "actions": "Actions"
  },
  "notifications": {
    "delete_success": "Homework successfully deleted",
    "delete_error": "Failed to delete homework",
    "create_success": "Homework successfully created",
    "create_error": "Failed to create homework",
    "save_success": "Homework successfully saved",
    "save_error": "Failed to save homework"
  },
  "delete_confirm": {
    "title": "Confirm Deletion",
    "description": "Are you sure you want to delete this homework? This action cannot be undone.",
    "bulk_description": "Are you sure you want to delete {count} selected homeworks? This action cannot be undone."
  },
  "form": {
    "name": "Homework Title",
    "name_placeholder": "Enter title",
    "lesson": "Lesson",
    "search_lesson": "Select lesson"
  }
};

function injectHomework(file, hwObj) {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  if (data.Materials && !data.Materials.homework) {
    data.Materials.homework = hwObj;
    data.Materials.picker_title_homework = file === 'uk.json' ? 'Оберіть домашнє завдання' : 'Select homework';
    data.Materials.homeworks = file === 'uk.json' ? 'Домашні завдання' : 'Homeworks'; // Global name
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Skipped ${file} (hw present or Materials missing)`);
  }
}

injectHomework('uk.json', homeworkUk);
injectHomework('en.json', homeworkEn);
