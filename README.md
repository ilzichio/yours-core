Datt
====
Datt is:
- A community with aligned incentives.
- A way to pay and be paid for content.
- A tool for managing content and payments.
- A decentralized reddit where karma is bitcoin.
- A solution to the incentives problem of social media.

Datt is currently undergoing heavy development. [Our issues are tracked on
GitHub.](https://github.com/dattnetwork/datt/issues).

---------------------

To develop on Datt, first clone this repo, then ensure you are running node 4,
then run:
```
npm install
```
From inside the repo.

To run all of Datt tests:
```
npm test
```

To run only the node tests:
```
npm run watch-test-node
```

Then save a file and the tests will run.

To run only the browser tests:
```
npm run serve
```

This will serve the files, run the PeerJS rendezvous server, and run a
browser-sync proxy server that will automatically refresh your browser when the
files change. You can then access the tests at:

```
http://localhost:3040/tests.html
```

Or access the app itself at:

```
http://localhost:3040/
```

The file layout is as follows:
- lib/ - the application logic
- views/ - the React front-end
- test/lib/ - tests for application logic
- test/views/ - tests for React front-end
- build/ - built files and static files for the browser
