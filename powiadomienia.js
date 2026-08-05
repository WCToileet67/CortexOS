// ============================================================
// jadro/powiadomienia.js – Notification System
// ============================================================

import { showToast } from '../main.js';

let notifications = [];
let isOpen = false;

export const NotificationManager = {
    init() {
        // Load saved
        try {
            const saved = localStorage.getItem('cortexos_notifications');
            if (saved) {
                notifications = JSON.parse(saved);
            }
        } catch (_) { /* ignore */ }

        this.renderCenter();

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (isOpen) {
                const center = document.getElementById('notifCenter');
                const icon = document.getElementById('notifIcon');
                if (!center.contains(e.target) && !icon.contains(e.target)) {
                    this.close();
                }
            }
        });
    },

    add(icon, message, persist = false) {
        const notif = {
            id: Date.now() + Math.random(),
            icon,
            message,
            time: new Date().toLocaleString(),
            timestamp: Date.now(),
        };
        notifications.unshift(notif);
        if (notifications.length > 50) notifications.pop();

        // Save
        try {
            localStorage.setItem('cortexos_notifications', JSON.stringify(notifications));
        } catch (_) { /* ignore */ }

        this.renderCenter();

        // Toast
        showToast(icon, message, persist ? 0 : 3000);

        return notif;
    },

    toggle() {
        if (isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        const center = document.getElementById('notifCenter');
        center.classList.add('open');
        center.style.display = 'flex';
        isOpen = true;
        this.renderCenter();
    },

    close() {
        const center = document.getElementById('notifCenter');
        center.classList.remove('open');
        center.style.display = 'none';
        isOpen = false;
    },

    renderCenter() {
        const list = document.getElementById('notifCenterList');
        list.innerHTML = '';

        if (notifications.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'padding: 24px; text-align:center; color: var(--text-secondary);';
            empty.textContent = 'No notifications';
            list.appendChild(empty);
            return;
        }

        notifications.forEach((n) => {
            const div = document.createElement('div');
            div.className = 'notif-center-item';
            div.innerHTML = `
                <span class="notif-icon">${n.icon}</span>
                <span class="notif-text">${n.message}</span>
                <span class="notif-time">${n.time}</span>
            `;
            list.appendChild(div);
        });
    },

    clearAll() {
        notifications = [];
        try {
            localStorage.setItem('cortexos_notifications', JSON.stringify(notifications));
        } catch (_) { /* ignore */ }
        this.renderCenter();
        showToast('🗑️', 'All notifications cleared');
    },

    getCount() {
        return notifications.length;
    },
};

// Setup clear all button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('notifClearAll').addEventListener('click', () => {
        NotificationManager.clearAll();
    });
    document.getElementById('notifClose').addEventListener('click', () => {
        NotificationManager.close();
    });
});