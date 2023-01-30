
// Yeah, Jetty!
const Jetty = require("jetty");
const chalk = require("chalk");

// Create a new Jetty object. This is a through stream with some additional
// methods on it. Additionally, connect it to process.stdout
const jetty = new Jetty(process.stdout);

const keypress = require("keypress");

function replace_all(str, char=" ") {
    return repeat(char, str.length);
}

function right_pad(str, char=" ", n) {
    while(str.length < n) {
        str += char;
    }
    return str
}

function left_pad(str, char=" ", n) {
    while(str.length < n) {
        str = char + str;
    }
    return str
}

function repeat(str=" ", i = 1) {
    let out = "";
    for(let j = i-1; j >= 0; j--) {
        out += str;
    }
    return out;
}



class cli_empty_menu {
    constructor() {
    }

    get_menu_color(i, str) {
    }

    draw_menu_item(i) {
    }

    draw_full_menu() {
    }

    increment(i=1) {
    }

    clear() {
        
    }

    select() {
    }
}

let curr_menu = new cli_empty_menu();

class cli_logger {
    constructor(line_start) {
        this.line_start = line_start;
        this.lines = [];
        this.width = 100;
    }

    draw() {
        // jetty.moveTo([this.line_start,0]).text(chalk.whiteBright.bold(`╔${repeat("═",this.width)}╗\n║${right_pad("  logs", " ", this.width)}║\n╠${repeat("═",this.width)}╣\n`));
        
        jetty.moveTo([this.line_start,0]).text(chalk.whiteBright.bold(`╔${right_pad("══ logs ", "═", this.width)}╗\n`));
        

        for(var i = 20; i > 0; i --) {
            let line = "";
            if(this.lines.length >= i) {
                line = this.lines[this.lines.length-i].logged;
            }
            jetty.text(chalk.whiteBright.bold(`║${right_pad(line, " ", this.width)}║`)).text("\n");
        }
        jetty.text(`╚${repeat("═",this.width)}╝`)

        jetty.moveTo([10000,100000]);
    }

    to_log_obj(obj, level = 0) {
        const str = right_pad(` ${obj}`, " ", this.width);

        if(level == 0){
            return {
                line: str,
                logged: chalk.gray(str)
            };
        }else if(level == 1) {
            return {
                line: str,
                logged: chalk.blue.bold(str)
            };
        }else if(level == 2) {
            return {
                line: str,
                logged: chalk.yellowBright.bold(str)
            };
        }else if(level == 3) {
            return {
                line: str,
                logged: chalk.redBright.bold(str)
            };
        }
    }

    log(line, level=0) {
        this.lines.push(this.to_log_obj(line, level));
        this.draw()
    }

    err(line) {
        this.log(line, 3)
    }

    info(line) {
        this.log(line, 1);
    }

    warn(line) {
        this.log(line, 2);
    }
}

const logger = new cli_logger(42);


class cli_menu {
    constructor(prompt, menu_items, line_start, callbacks) {
        this.prompt = prompt;
        this.menu_items = menu_items;
        this.line_start = line_start;
        this.cursor = 0
        this.callbacks = callbacks;
    }

    get_menu_color(i, str) {
        if(i == this.cursor) {
            return chalk.blueBright.bold(" > "+str);
        }
        return chalk.grey("   "+str);
    }

    draw_menu_item(i) {
        if(i >= this.menu_items.length) return;
        jetty.moveTo([this.line_start + i + 1,0]).text(this.get_menu_color(i, this.menu_items[i]));
        jetty.moveTo([1000,0]);
    }

    draw_full_menu() {
        jetty.moveTo([this.line_start,0]).text(chalk.whiteBright.bold(this.prompt));
        this.menu_items.forEach((_, i) => this.draw_menu_item(i));
        jetty.moveTo([1000,0]);
    }

    increment(i=1) {
        const old = this.cursor;
        this.cursor += i;
        this.cursor = Math.min(Math.max(this.cursor, 0), this.menu_items.length-1);
        if(old == this.cursor) return;
        this.draw_menu_item(old);
        this.draw_menu_item(this.cursor);
    }

    clear() {
        jetty.moveTo([this.line_start,0]).text(repeat(" ", this.prompt.length));
        this.menu_items.forEach((item, i) => jetty.moveTo([this.line_start + i + 1,0]).text(repeat(" ", item.length+3)));
        jetty.moveTo([1000,0]);
        
    }

    select() {
        this.callbacks[this.cursor]();
    }
}

class cli_menu_switcher {
    constructor() {
        this.menu = null;
    }

    switch_menu(menu) {
        if(this.menu) this.menu.clear();
        this.menu = menu;
        this.draw_full_menu();
        return this;
    }

    increment(i = 1) {
        this.menu.increment(i);
        return this;
    } 

    get_menu_color(i, str) {
        return this.menu.get_menu_color(i, str);
    }

    draw_menu_item(i) {
         this.menu.draw_menu_item(i);
        return this;
    }

    draw_full_menu() {
        this.menu.draw_full_menu();
        return this;
    }

    select() {
        this.menu.select();
        return this;
    }
}

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
 
// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if(key == null) {
        return;
    }
    if(key.name == "up") {
        curr_menu.increment(-1);
    }else if(key.name == "down") {
        curr_menu.increment();
    }else if(key.name == "return") {
        curr_menu.select();
    }
    else if (key && key.ctrl && key.name == 'c') {
        process.exit(0);
    }
    // console.log(key)
});
 
process.stdin.setRawMode(true);
process.stdin.resume();

const { table } = require('table');

class cli_table {
    constructor(data = [[]], line_start = 0) {
        this.data = data;
        this.line_start = line_start;
    }

    set_data(data = [[]]) {
        this.clear();
        this.data = data;
        this.draw();
    }

    color_object(obj) {
        const type = typeof(obj);
        const str = `${obj}`;
        if(type === "number") {
            return chalk.greenBright(str);
        }else if(type === "boolean") {
            return chalk.blueBright(str);
        }else if(type === "object") {
            return chalk.yellowBright(str);
        }else if(type === "string"){
            return chalk.whiteBright(str);
        }
    }

    clear() {
        jetty.moveTo([this.line_start,0]).text(repeat(repeat(" ", 100) + "\n", this.data.length * 4 + 1));
        jetty.moveTo([100000,100000]);
    }

    draw() {
        const drawn = this.data.map(a => a.map(b => this.color_object(b)));
        
        jetty.moveTo([this.line_start,0]).text(table(drawn));
        jetty.moveTo([100000,100000]);
    }
}

const set_active_menu = (menu) => {
    curr_menu = menu;
    curr_menu.draw_full_menu();
}

module.exports = {logger, cli_menu, cli_table, cli_menu_switcher, set_active_menu}