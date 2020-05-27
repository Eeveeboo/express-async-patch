# express-async-patch

Express doesn't handle async errors by default unfortunately, here's a quick and easy solution!

MIT Licensed - Have fun and use however you like!

## Usage

```ts
import express from 'express';
import expressAsyncPatch from './express-async-patch';

// The patch needs to be called BEFORE you create a router or app
expressAsyncPatch((err,req,res,next)=>{
    // This is how I like to handle errors, you can implement any function you like here.
    if(req.path.indexOf("/api") == 0)
        // Send JSON error response
        res.status(501).json({
            status: false,
            message: err.message,
            data: err.stack
        });
    else
        // Send Express error response
        next(err);
});
const app = express();

// Normally this would just result in the webpage hanging
app.use(async (req,res)=>{
    throw new Error("Async Error Test.");
});
```