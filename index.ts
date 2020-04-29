import express from "express";
import path from "path";

const low = require('lowdb');
import FileSync from 'lowdb/adapters/FileAsync';
import fs from 'fs';


function walkSync(dir, filelist) {

    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        } else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
}

async function app() {

    const adapter = new FileSync('db.json');
    const db = await low(adapter);

    db.defaults({
        videofolder: 'videos',
        bookmarks: [],
    }).write();

    const app = express();
    const port = 8080; // default port to listen
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
// Configure Express to use EJS
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

    app.post("/options", (req, res) => {
        if (fs.existsSync(req.body.videofolder)) {
            db.set('videofolder', req.body.videofolder).write();
            res.redirect('/');
        } else {
            res.sendStatus(400);
        }
    });

// define a route handler for the default home page
    app.get("/", (req, res) => {
        // render the index template
        const f = [];
        const re = db.get('videofolder').value();
        walkSync(re, f);
        const reet=db.get('bookmarks');
        res.render("index", {
            videos: f.map(x => {
                return {
                    file: x,
                    bookmarks: reet.filter({file: x}).value(),
                };
            })
        });
    });

    app.post('/bookmark', (req, res) => {
        if (req.body.add === 'yes') {
            db.get('bookmarks')
                .push({time: req.body.time, file: req.body.file})
                .write();
        } else {
            db.get('bookmarks')
                .remove({time: req.body.time, file: req.body.file})
                .write();
        }
        res.sendStatus(200);

    });

    app.get("/viewvideo", (req, res) => {
        // render the index template
        const f = req.query.file as string;
        const time = Number.parseFloat(req.query.time as string) || 0;
        const video = {
            title: path.basename(f),
            file: f,
            url: `/video?file=${encodeURIComponent(f)}`,
            fps: 24,//TODO actually detect fps
            time,
            bookmarks: db.get('bookmarks').filter({file: f}).value()
        };
        // console.log(req.query);
        res.render("viewvideo", {
            video,
        });
    });

    app.get('/video', function (req, res) {
        const path = req.query.file as string;
        const stat = fs.statSync(path);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(path, {start, end});
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res)
        }
    });

// start the express server
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
}

app();
