# Express.js Request Queue

> Uses stack and Async/Await approach

Use this for your express routes if you need those concurrent requests to behave in sequence. If you don't need every request to be queued, set a config and specify your unique identifier to group the queues.

## Installation

```bash
> npm install express-request-queue --save
```

## Usage

```js
import RequestQ from 'express-request-queue';

const q = RequestQ();

route.post('/book', q.run(async (req, res, next) {
    await longRunningTask();
    res.json({});
}));
```

### Group queues

Grouping queues base on your request payload:

```js
const config = {
    unique: true, // by setting this to true, queues are grouped by thier identifiers
    from: 'body', // what type of req payload the identifier is located from
    name: 'id' // name of the field to reference from
}

const q = RequestQ(config);
```

## License

MIT

## Maintainer

[John Edward Escuyos](http://github/jeescu)

## Contributor

[Jeserie Golo](http://github/kenjoe)