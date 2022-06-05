import express from 'express'
import multer from 'multer'
import * as tf from '@tensorflow/tfjs-node'
import { load } from 'nsfwjs'
import sharp from 'sharp';
import { webp2gif, mp4toGif, webp2png, gifReducer } from './formatFiles.js'

const app = express()
const upload = multer()

let _model

app.post('/', upload.single("image"), async (req, res) => {
	if (!req.file) return res.status(400).send("multipart/form-data não encontrado");
	var extension = req.file.originalname
	extension = extension.split('.').pop()
	console.log(extension)
	switch (extension) {

		case 'webp':
			let { pages } = await sharp(req.file.buffer).metadata();
			if (!pages || pages == 1) {
				var Buf = await webp2png(req.file.buffer)
				var image = await tf.node.decodeImage(Buf, 3)
				var predictions = await _model.classify(image)
				console.log(JSON.stringify(predictions, null, 2))
				return res.json(predictions)
			} else {
				var Buf = await webp2gif(req.file.buffer)
				var predictions = await _model.classifyGif(Buf)
				console.log(JSON.stringify(predictions[0], null, 2))
				return res.json(predictions)
			}
		case 'gif':
			var Buf = await gifReducer(req.file.buffer)
			var predictions = await _model.classifyGif(Buf)
			console.log(JSON.stringify(predictions[0], null, 2))
			res.json(predictions)
			break;

		case 'mp4':
			if (req.file.size >= 10000000) return res.status(400).send("arquivo acima do limite de 10mb");
			var Buf = await mp4toGif(req.file.buffer)
			var predictions = await _model.classifyGif(Buf)
			console.log(JSON.stringify(predictions[0], null, 2))
			res.json(predictions)
			break;

		case 'jpg':
		case 'jpeg':
		case 'png':
			var image = await tf.node.decodeImage(req.file.buffer, 3)
			var predictions = await _model.classify(image)
			image.dispose()
			console.log(JSON.stringify(predictions, null, 2))
			res.json(predictions)
			break;

		default:
			res.status(400).send("unknown file type")
			break;
	}
})


const load_model = async () => {
	_model = await load('file://model/', { type: 'graph' })
}
const porta = process.env.PORT || 3000
// Keep the model in memory, make sure it's loaded only once
load_model()
	.then(() => {
		app.listen(porta, function () {
			console.log("Listening on port ", porta)
			if (porta == 3000) { console.log('rodando localmente em http://localhost:3000') }
		})
	})
