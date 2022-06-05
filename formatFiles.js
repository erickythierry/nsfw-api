import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import fs from 'fs'


export async function mp4toGif(file) {
    var nome = './files/' + Date.now() + '.mp4'
    var gif = './files/' + Date.now() + '.gif'
    return new Promise((resolve, reject) => {
        fs.writeFile(nome, file, (err) => {
            if (err) return reject(err);
            ffmpeg(nome)
                .addOutputOption([
                    '-ss', '00', '-t', '5', '-vf',
                    'fps=5,scale=300:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
                    '-loop', '0'
                ])
                .toFormat('gif')
                .on('end', () => {
                    fs.unlinkSync(nome)
                    var buf = fs.readFileSync(gif)
                    resolve(buf)
                })
                .on('error', (err) => { reject(err) })
                .save(gif)
        })
    })
}

export async function webp2gif(file) {
    let { pages } = await sharp(file).metadata();
    pages = pages >= 30 ? 30 : pages;
    return new Promise(async (resolve, reject) => {
        sharp(file, { animated: true, pages: pages })
            .gif()
            .toBuffer((err, data, info) => {
                if (err) return reject(err)
                resolve(data)
            })
    })
}

export async function webp2png(file) {
    return new Promise(async (resolve, reject) => {
        sharp(file, { page: 1 })
            .png()
            .toBuffer((err, data, info) => {
                if (err) return reject(err)
                resolve(data)
            })
    })
}

export async function gifReducer(file) {
    let { pages } = await sharp(file).metadata();
    pages = pages >= 30 ? 30 : pages;
    return new Promise(async (resolve, reject) => {
        sharp(file, { animated: true, pages: pages })
            .gif()
            .toBuffer((err, data, info) => {
                if (err) return reject(err)
                resolve(data)
            })
    })
}