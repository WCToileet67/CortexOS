// ============================================================
// aplikacje/przypomnienia.js – Reminders App
// ============================================================

import { showToast } from '../main.js';

const STORAGE_KEY = 'cortexos_reminders';

function loadReminders() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (_) {
        return [];
    }
}

function saveReminders(reminders) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (_) { /* ignore */ }
}

function formatReminderDate(value) {
    if (!value) return 'No due date';
    return new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Reminders() {
    const container = document.createElement('div');
    container.className = 'reminders-app';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Reminders');

    let reminders = loadReminders();

    container.innerHTML = `
        <form class="reminder-form">
            <input class="reminder-text" type="text" placeholder="Add a reminder..." maxlength="120" required />
            <input class="reminder-date" type="datetime-local" />
            <button type="submit">Add</button>
        </form>
        <div class="reminder-toolbar">
            <button class="reminder-filter active" type="button" data-filter="all">All</button>
            <button class="reminder-filter" type="button" data-filter="open">Open</button>
            <button class="reminder-filter" type="button" data-filter="done">Done</button>
            <button class="reminder-clear" type="button">Clear done</button>
        </div>
        <ul class="reminder-list"></ul>
    `;

    const form = container.querySelector('.reminder-form');
    const textInput = container.querySelector('.reminder-text');
    const dateInput = container.querySelector('.reminder-date');
    const list = container.querySelector('.reminder-list');
    let activeFilter = 'all';

    function render() {
        const visible = reminders.filter((reminder) => {
            if (activeFilter === 'open') return !reminder.done;
            if (activeFilter === 'done') return reminder.done;
            return true;
        });

        list.replaceChildren();

        if (visible.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'reminder-empty';
            empty.textContent = '✨ No reminders here.';
            list.appendChild(empty);
            return;
        }

        visible.forEach((reminder) => {
            const item = document.createElement('li');
            item.className = reminder.done ? 'reminder-item done' : 'reminder-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = reminder.done;
            checkbox.addEventListener('change', () => {
                reminder.done = checkbox.checked;
                saveReminders(reminders);
                render();
            });

            const body = document.createElement('div');
            body.className = 'reminder-body';

            const title = document.createElement('strong');
            title.textContent = reminder.text;

            const due = document.createElement('span');
            due.textContent = formatReminderDate(reminder.dueAt);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.title = 'Delete reminder';
            remove.textContent = '🗑️';
            remove.addEventListener('click', () => {
                reminders = reminders.filter((itemToKeep) => itemToKeep.id !== reminder.id);
                saveReminders(reminders);
                render();
            });

            body.append(title, due);
            item.append(checkbox, body, remove);
            list.appendChild(item);
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = textInput.value.trim();
        if (!text) return;

        reminders.unshift({
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            text,
            dueAt: dateInput.value || '',
            done: false,
            createdAt: new Date().toISOString(),
        });
        saveReminders(reminders);
        textInput.value = '';
        dateInput.value = '';
        showToast('⏰', 'Reminder added');
        render();
    });

    container.querySelectorAll('.reminder-filter').forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            container.querySelectorAll('.reminder-filter').forEach((filterButton) => {
                filterButton.classList.toggle('active', filterButton === button);
            });
            render();
        });
    });

    container.querySelector('.reminder-clear').addEventListener('click', () => {
        reminders = reminders.filter((reminder) => !reminder.done);
        saveReminders(reminders);
        render();
    });

    render();
    setTimeout(() => textInput.focus(), 50);
    return container;
}
