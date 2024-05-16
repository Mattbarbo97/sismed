export default function takeFirst80Char(str) {
    var text = str.substring(0, 80);

    if (str.length > 80) {
        text += "...";
    }

    return text;
}
