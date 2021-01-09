module.exports = class Collection extends Map {
    first() {
        return Array.from(this)[0];
    }

    last() {
        let temp = Array.from(this);
        return temp[temp.length - 1];
    }
}