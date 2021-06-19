const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("./mplus_j12r.bdf");
const text = decoder.decode(data);
const chars = text.split(/CHARS \d+/)[1].split(/ENDCHAR/).map(_ => _.trim());
const file = await Deno.open("./font.bin", { write: true, truncate: true, create: true });

const headerBlock = new Uint8Array(8 * 0x20000);
for(let i = 0; i < 0x20000; i++) {
  const element = new Uint8Array([
    // TODO: ちゃんと文字の存在を見て判断する
    0x01, // Flags
    0x00, // Index in pallete data (3 bytes)
    0x00, //
    0x00, //
    0x0c, // Width
    0x0d, // Height
    0x0d, // Ascend
    0x00  // Unused
  ]);
  headerBlock.set(element, 8 * i);
}

const palleteDataBlock = new Uint8Array(64 * 6963);
for(let i = 0; i < 6963; i++) {
  const bitmap = chars[i].split(/BITMAP\n/)[1];
  const lines = bitmap.split(/\n/).map(_ => parseInt(_, 16));
  const chara = new Uint8Array(64);
  for(let j = 0; j < 16; j++) {
    chara.set([
      (0xFF00 & lines[j] >> 8),
      0x00,
      (0x00FF & lines[j]),
      0x00
    ], 4 * j);
  }
  palleteDataBlock.set(chara, 8 * i);
}

await Deno.write(file.rid, headerBlock);
await Deno.write(file.rid, palleteDataBlock);

Deno.close(file.rid);
