const fs = require('fs')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const imageminWebp = require('imagemin-webp')

// 引数で受け取ったディレクトリの配下を取得
const getDirRecursively = (dir) => {
  const getChildrenRecursively = (dir) => {
    const readdir = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())

    if (readdir.length === 0) {
      return dir
    } else {
      return readdir
        .map((p) => getChildrenRecursively(`${dir}/${p.name}`))
        .flat()
    }
  }
  return [dir, ...getChildrenRecursively(dir)]
}

;(async () => {
  const files = []
  const sourceDirs = getDirRecursively('static/src/img') //対象フォルダ
  for (let inDir of sourceDirs) {
    // static/src/img/001 => static/img/001
    const destDir = inDir.replace('src/', '')
    const filesInDir = await imagemin([`${inDir}/*.{jpg,png,JPG,PNG}`], {
      destination: destDir,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    })
    files.push(...filesInDir)

    let sourceWebpDir = inDir.replace('src/', 'img/webp/')
    sourceWebpDir = sourceWebpDir.split('/')
    sourceWebpDir = sourceWebpDir.filter((x, i, self) => {
      return self.indexOf(x) === i
    })
    sourceWebpDir = sourceWebpDir.join('/')
    const filesInDir01 = await imagemin([`${inDir}/*.{jpg,png,JPG,PNG}`], {
      destination: sourceWebpDir,
      plugins: [imageminWebp({ quality: 75 })],
    })
    files.push(...filesInDir01)
  }
})()
