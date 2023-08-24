/*
 * Originally based on bootstrap-icons-vue:
 * https://github.com/tommyip/bootstrap-icons-vue/blob/master/src/codegen.js
 */

import fs from 'fs';
import path from 'path';
import * as url from 'url';
import {JSDOM} from "jsdom";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const outputPath = path.resolve(__dirname, './vue/components/Common/icons.ts');
const iconsPath = path.resolve(__dirname, './icons');

const templateHeader = `\
// This file is generated by genicons.mjs. Do not modify directly.

interface Icon {
  viewBox: string,
  contents: string
}

`;

const iconComponentTemplate = `export const Icon{{componentName}}: Icon = {
  viewBox: '{{svgViewBox}}',
  contents: '{{svgContents}}'
};`;

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function kebab2pascal(kebab) {
    return kebab.split('_').map(capitalize).join('');
}

function genIconComponents() {
    const filenames = fs.readdirSync(iconsPath);
    const iconComponentExports = [];

    for (const filename of filenames) {
        const componentName = kebab2pascal(filename.substring(0, filename.length - 4));

        const content = fs.readFileSync(path.join(iconsPath, filename), {encoding: 'utf-8'});
        const svgDom = new JSDOM(content, {
            contentType: "image/svg+xml"
        });

        const svgInner = svgDom.window.document.getElementsByTagName('svg')[0];

        const svgViewBox = svgInner.getAttribute('viewBox');
        const svgContents = svgInner.innerHTML;

        const iconComponentExport = iconComponentTemplate
                .replace('{{componentName}}', componentName)
                .replace('{{svgViewBox}}', svgViewBox)
                .replace('{{svgContents}}', svgContents);

        iconComponentExports.push(iconComponentExport);
    }

    fs.writeFileSync(
            outputPath,
            templateHeader + iconComponentExports.join('\n')
    );
}

genIconComponents();
