module.exports = {
    replace_all(str, char=" ") {
        return repeat(char, str.length);
    },

    right_pad(str, char=" ", n) {
        while(str.length < n) {
            str += char;
        }
        return str
    },

    left_pad(str, char=" ", n) {
        while(str.length < n) {
            str = char + str;
        }
        return str
    },

    repeat(str=" ", i = 1) {
        let out = "";
        for(let j = i-1; j >= 0; j--) {
            out += str;
        }
        return out;
    },
}