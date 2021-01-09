const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

class Utils {
  /**
   * Sets default properties on an object that aren't already specified.
   * @param {Object} def Default properties
   * @param {Object} given Object to assign defaults to
   * @returns {Object}
   */
  static mergeDefault(def, given) {
    if (!given) return def;
    for (const key in def) {
      if (!has(given, key) || given[key] === undefined) {
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        given[key] = Utils.mergeDefault(def[key], given[key]);
      }
    }

    return given;
  }

  static capitalize(text = "", full = false, ...sep) {
    text = text.toLowerCase();
    if (!full) {
      return Utils.uFistChar(text);
    }
    let separator;

    if (!sep || sep && sep.length === 0) {
      separator = ["_"];
    } else {
      separator = sep;
    }

    return text
      .replace(new RegExp(`(${separator.join("|")})+`, "gmi"), " ")
      .split(/\s+/gim)
      .map((t) => Utils.uFistChar(t))
      .join(" ");
  }

  static uFistChar(string) {
    if (string && typeof string === "string") {
      string = string.split("");
      return string.shift().toUpperCase() + string.join("");
    }
    return string;
  }

  static wait (time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }
}

module.exports = Utils;
