import {
  writeAll
} from "https://deno.land/std@0.99.0/io/mod.ts";

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

const patternDataBlock = new Uint8Array(64 * 6963);
for(let i = 0; i < 6963; i++) {
  const bitmap = chars[i].split(/BITMAP\n/)[1];
  const lines = bitmap.split(/\n/).map(_ => parseInt(_, 16));
  const chara = new Uint8Array(64);

  for(let j = 0; j < 8; j++) {
    const line = lines[j] ? lines[j] : 0;
    chara.set([
      (line >> 8) & 0x00FF,
      0x00,
    ], 2 * j);

    chara.set([
      (line & 0x00FF),
      0x00
    ], 16 + 2 * j);
  }

  for(let j = 8; j < 16; j++) {
    const line = lines[j] ? lines[j] : 0;
    chara.set([
      (line >> 8) & 0x00FF,
      0x00,
    ], 32 + 2 * (j - 8));

    chara.set([
      (line & 0x00FF),
      0x00
    ], 48 + 2 * (j - 8));
  }

  patternDataBlock.set(chara, 64 * i);
}

// await writeAll(file, headerBlock);
await writeAll(file, patternDataBlock);

Deno.close(file.rid);
