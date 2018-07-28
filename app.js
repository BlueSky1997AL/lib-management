const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const DB = require('nedb');

const app = new express();
const db = new DB({ filename: 'Lib_DB', autoload: true });

// 应用中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 读取文件作为返回内容
function renderWebPage(path) {
    return (req, res) => {
        const webPage = fs.readFileSync(path);
        res.end(webPage);
    }
}

// 管理员相关
app.get('/manager/login', renderWebPage('view/manager_login.html'));
app.post('/manager/dash_board', async (req, res) => {
    const { id: username , pswd: password } = req.body;
    try {
        if (username && password) {
            await new Promise((resolve, reject) => {
                db.findOne({ type: 'admin', username: username }, (err, doc) => {
                    if (err) { reject('QUERY_FAILURE'); return; }
                    if (!doc) { reject('USER_NOT_FOUND'); return; }
                    if (password === doc.password) {
                        const webPage = fs.readFileSync('view/manager_view.html');
                        res.end(webPage);
                        resolve();
                    } else {
                        reject('INCORRECT_PASSWORD');
                    }
                });
            })
        } else {
            throw new Error('INVALID_USERNAME_OR_PASSWORD');
        }
    } catch (error) {
        res.redirect(`/manager/login?err=${error}`);
    }
});

// 用户相关
app.get('/', renderWebPage('view/user_view.html'));

// 书籍相关
app.post('/books/create', (req, res) => {
    const { name, author, rentable, borrower, remarks } = req.body;
    db.insert({ type: 'book', name, author, rentable, borrower, remarks }, (err) => {
        if (err) { res.json({ status: 'error', message: err }); return; }
        res.json({ status: 'success', message: '操作成功' });
    });
});
app.post('/books/update', (req, res) => {
    const { id, name, author, rentable, borrower, remarks } = req.body;
    db.update(
        { type: 'book', _id: id },
        {
            type: 'book',
            name,
            author,
            rentable,
            borrower,
            remarks
        },
        err => {
            if (err) { res.json({ status: 'error', message: err }); return; }
            res.json({ status: 'success', message: '操作成功' });
        }
    )
});
app.delete('/books/remove', (req, res) => {
    const { id } = req.body;
    db.remove({ _id: id }, {}, (err, num) => {
        if (err) { res.json({ status: 'error', message: err }); return; }
        res.json({ status: 'success', message: `成功删除了${num}条数据` });
    })
})
app.get('/books/list', (req, res) => {
    db.find({ type: 'book' }, (err, doc) => {
        if (err) { res.json({ status: 'error', message: err }); return; }
        res.json({ status: 'success', message: '操作成功', data: doc });
    })
});

const APP_PORT = 3000;
app.listen(APP_PORT, () => {
    console.log(`Service is running at port ${APP_PORT}`);
})
