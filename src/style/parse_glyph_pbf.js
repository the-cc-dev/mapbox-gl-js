// @flow

const {AlphaImage} = require('../util/image');
const Protobuf = require('pbf');
const border = 3;

import type {StyleGlyph} from './style_glyph';

function readFontstacks(tag: number, glyphs: Array<StyleGlyph>, pbf: Protobuf) {
    if (tag === 1) {
        pbf.readMessage(readFontstack, glyphs);
    }
}

function readFontstack(tag: number, glyphs: Array<StyleGlyph>, pbf: Protobuf) {
    if (tag === 3) {
        const {id, bitmap, width, height, left, top, advance} = pbf.readMessage(readGlyph, {});
        glyphs.push({
            id,
            bitmap: AlphaImage.create({
                width: width + 2 * border,
                height: height + 2 * border
            }, bitmap),
            metrics: {width, height, left, top, advance}
        });
    }
}

function readGlyph(tag: number, glyph: Object, pbf: Protobuf) {
    if (tag === 1) glyph.id = pbf.readVarint();
    else if (tag === 2) glyph.bitmap = pbf.readBytes();
    else if (tag === 3) glyph.width = pbf.readVarint();
    else if (tag === 4) glyph.height = pbf.readVarint();
    else if (tag === 5) glyph.left = pbf.readSVarint();
    else if (tag === 6) glyph.top = pbf.readSVarint();
    else if (tag === 7) glyph.advance = pbf.readVarint();
}

module.exports = function (data: ArrayBuffer | Uint8Array): Array<StyleGlyph> {
    return new Protobuf(data).readFields(readFontstacks, []);
};

module.exports.GLYPH_PBF_BORDER = border;
