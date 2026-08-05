// ============================================================
// aplikacje/terminal.js – Terminal App
// ============================================================

export default function Terminal() {
    const container = document.createElement('div');
    container.className = 'terminal-wrap';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Terminal');
    container.style.cssText =
        'background:#0a0a0a;border-radius:4px;padding:8px;font-family:monospace;color:#0f0;min-height:300px;max-height:400px;overflow-y:auto;';

    const output = document.createElement('div');
    output.id = 'termOutput';

    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input-line';
    const prompt = document.createElement('span');
    prompt.className = 'term-prompt';
    prompt.textContent = 'user@cortex:~$';
    const input = document.createElement('input');
    input.type = 'text';
    input.autofocus = true;
    input.style.cssText =
        'flex:1;background:transparent;border:none;color:#0f0;font-family:inherit;font-size:14px;outline:none;padding:2px 0;';

    inputLine.append(prompt, input);
    container.append(output, inputLine);

    const fs = {
        '/': { type: 'folder', children: { home: { type: 'folder', children: {} } } },
        '/home': { type: 'folder', children: {} },
    };
    let cwd = '/home';
    let username = 'user';

    function getNode(path) {
        if (path === '/') return fs['/'];
        const parts = path.split('/').filter(Boolean);
        let node = fs['/'];
        for (const part of parts) {
            if (!node.children || !node.children[part]) return null;
            node = node.children[part];
        }
        return node;
    }

    function resolvePath(path) {
        if (path.startsWith('/')) return path;
        if (path === '..') {
            const parts = cwd.split('/').filter(Boolean);
            parts.pop();
            return '/' + parts.join('/') || '/';
        }
        if (path === '.') return cwd;
        return cwd === '/' ? '/' + path : cwd + '/' + path;
    }

    function log(text, color = '#0f0') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.style.color = color;
        line.textContent = text;
        output.appendChild(line);
        container.scrollTop = container.scrollHeight;
    }

    function execute(cmd) {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                log('Available commands:');
                log(
                    '  help, clear, echo, ls, cd, mkdir, rm, cat, touch, date, whoami, calc, pwd'
                );
                break;

            case 'clear':
                output.innerHTML = '';
                break;

            case 'echo':
                log(args.join(' ') || '');
                break;

            case 'pwd':
                log(cwd);
                break;

            case 'whoami':
                log(username);
                break;

            case 'date':
                log(new Date().toString());
                break;

            case 'ls': {
                const node = getNode(cwd);
                if (!node || node.type !== 'folder') {
                    log('Not a directory', '#ff6b6b');
                    break;
                }
                const items = Object.keys(node.children || {});
                if (items.length === 0) {
                    log('(empty)');
                } else {
                    log(items.join('  '));
                }
                break;
            }

            case 'cd': {
                const target = args[0] || '/';
                const resolved = resolvePath(target);
                const node = getNode(resolved);
                if (!node || node.type !== 'folder') {
                    log(`cd: ${target}: No such directory`, '#ff6b6b');
                } else {
                    cwd = resolved;
                }
                break;
            }

            case 'mkdir': {
                const name = args[0];
                if (!name) { log('mkdir: missing operand', '#ff6b6b'); break; }
                const parent = getNode(cwd);
                if (!parent || parent.type !== 'folder') {
                    log('mkdir: not a directory', '#ff6b6b');
                    break;
                }
                if (parent.children[name]) {
                    log(`mkdir: ${name}: File exists`, '#ff6b6b');
                    break;
                }
                parent.children[name] = { type: 'folder', children: {} };
                log(`Created directory: ${name}`);
                break;
            }

            case 'touch': {
                const name = args[0];
                if (!name) { log('touch: missing operand', '#ff6b6b'); break; }
                const parent = getNode(cwd);
                if (!parent || parent.type !== 'folder') {
                    log('touch: not a directory', '#ff6b6b');
                    break;
                }
                if (!parent.children[name]) {
                    parent.children[name] = { type: 'file', content: '' };
                }
                log(`Touched: ${name}`);
                break;
            }

            case 'cat': {
                const name = args[0];
                if (!name) { log('cat: missing operand', '#ff6b6b'); break; }
                const parent = getNode(cwd);
                if (!parent || parent.type !== 'folder') {
                    log('cat: not a directory', '#ff6b6b');
                    break;
                }
                const file = parent.children[name];
                if (!file || file.type !== 'file') {
                    log(`cat: ${name}: No such file`, '#ff6b6b');
                    break;
                }
                log(file.content || '(empty)');
                break;
            }

            case 'rm': {
                const name = args[0];
                if (!name) { log('rm: missing operand', '#ff6b6b'); break; }
                const parent = getNode(cwd);
                if (!parent || parent.type !== 'folder') {
                    log('rm: not a directory', '#ff6b6b');
                    break;
                }
                if (parent.children[name]) {
                    delete parent.children[name];
                    log(`Removed: ${name}`);
                } else {
                    log(`rm: ${name}: No such file`, '#ff6b6b');
                }
                break;
            }

            case 'calc': {
                const expr = args.join(' ');
                if (!expr) { log('calc: missing expression', '#ff6b6b'); break; }
                try {
                    const result = Function(`"use strict"; return (${expr})`)();
                    log(`= ${result}`, '#4fc3f7');
                } catch (_) {
                    log('calc: invalid expression', '#ff6b6b');
                }
                break;
            }

            default:
                log(`Command not found: ${command}. Type "help" for list.`, '#ff6b6b');
                break;
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value;
            if (cmd.trim()) {
                log(`${username}@cortex:${cwd}$ ${cmd}`, '#888');
                execute(cmd);
            }
            input.value = '';
            container.scrollTop = container.scrollHeight;
        }
    });

    // Focus input on click
    container.addEventListener('click', () => input.focus());

    // Welcome message
    log('CortexOS Terminal v1.0');
    log('Type "help" for available commands.');
    log(`Welcome, ${username}!`);

    return container;
}
