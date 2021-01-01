const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("./mplus_j10r.bdf");

const text = decoder.decode(data);

const chars = text.split(/CHARS \d+/)[1].split(/ENDCHAR/).map(_ => _.trim());
const bitmap = chars[0].split(/BITMAP\n/)[1];

const lines = bitmap.split(/\n/).map(_ => parseInt(_, 16));

const encoder = new TextEncoder();
const file = await Deno.open("./font.bin", { write: true, truncate: true, create: true });

const output = new Uint8Array([
  (0xFF00 & lines[0] >> 8),
  0,
  (0x00FF & lines[0]),
  0
]);

const bytesWritten = await Deno.write(file.rid, output);

console.log(lines);


Deno.close(file.rid);
