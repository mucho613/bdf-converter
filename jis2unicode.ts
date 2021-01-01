import * as Encoding from "https://raw.githubusercontent.com/polygonplanet/encoding.js/master/encoding.js";

const convertTable = await fetch('http://x0213.org/codetable/sjis-0213-2004-std.txt');
const text = await convertTable.text();

const splittedTable = text.split("\n").filter(line => line.match(/^[^#]/));

console.log(splittedTable);

const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("./mplus_j10r.bdf");

// const text = decoder.decode(data);

const utf8Array = [8482];
