const {obs} = require('fnl');
const http = require('http');
const https = require('https');
const zlib = require('zlib')
const {clone} = require('lang-mini');

const {request} = http;

// Will still deal this with function calls to acheive a variety of things.
// Function calls to interpret results / the flow or status of other function calls.

// Or redirect handler right at the beginning - internal
//  Where maybe it would send data forward as though the redirect did not take place?
//   Or at least it will be simpler.


// A wrapped version that deals with compression could help.

// Advanced request being (almost) entirely different.

//  Be able to return additional functions that can be called while the obs is running?
//   After an error it won't return results.
//    Redirect is not actually an error though.
//    It's (maybe) an edge case.
//     A situation. Observale situation responsers may make sense.
//      As in observable would not be finished as normal perhaps.


// obs_redirectable_request may make sense as a function, that itself calls request one or more time.




const obs_request = (url, options = {}) => obs((next, complete, error) => {
    const method = options.method || 'get';

    // Include options / params in the result observable (somehow?)?
    //  A way to set observable properties?
    //  Call next with the url / options?

    options.url = url;
    next({
        type: 'options',
        options: options
    });

    // type checking...?

    const req = https.request(url, options, (response) => {
        //console.log('have response');

        // statuscode, headers, etc.

        //console.log('response.statusCode', response.statusCode);

        // Maybe just call it response.

        next({
            type: 'response',
            response: response
        });

        const {headers} = response;

        let i_chunk = 0;
        response.on('data', chunk => {
            next({
                type: 'chunk',
                chunk: chunk,
                index: i_chunk
            })

            i_chunk++;
        })
        response.on('end', () => {
            complete();
        })
    });

    // auto-close the request if it's a GET request?

    if (method === 'get') {
        req.end();
    }


    next({
        type: 'http-request',
        request: req
    });
    // stop, pause, unpause

    const stop = () => {

    }
    const pause = () => {

    }
    const unpause = () => {

    }

    return [stop, pause, unpause];

});

const obs_redirectable_request = (url, options = {}) => obs((next, complete, error) => {

    // Do the request...
    //  But it it redirects handle that.
    let called_options = options;

    called_options.url = url;
    next({
        type: 'options',
        options: called_options
    });
    const o_request = obs_request(url, options);
    let doing_redirect = false;


    o_request.on('complete', () => {
        if (doing_redirect) {

        } else {
            complete();
        }
    });

    o_request.on('next', o_next => {
        const {response, type, options} = o_next;
        if (options) {
            called_options = options;
        }
        if (response) {
            //  But there could be more than one response object in a sequence....
            const {headers, statusCode} = response;

            if (statusCode === 200) {

                next({
                    'type': 'response',
                    'response': response
                });


            } else {
                if (statusCode === 301) {
                    // redirect status
                    //  raising a redirect event makes sense.
                    const {location} = headers;
                    console.log('location', location);
                    console.log('called_options', called_options);
                    const o2 = clone(called_options);
                    
                    o2.url = location;
                    doing_redirect = true;

                    next({
                        'type': 'response',
                        'response': response
                    });

                    console.log('o2', o2);


                    const obs_request_redirected = obs_redirectable_request(location, o2);

                    // then pass / pipe it through...

                    next({
                        'type': 'redirect',
                        'statusCode': 301,
                        'location': location
                    });

                    obs_request_redirected.on('next', o_next => {
                        //console.log('o_next', o_next);
                        next(o_next);
                    });
                    obs_request_redirected.on('complete', () => {
                        complete();
                    })
                    obs_request_redirected.on('error', err => {
                        error(err);
                    })











                } else {
                    console.log('statusCode', statusCode);

                }

            }

        };

    });

    const stop = () => {

    }
    const pause = () => {

    }
    const unpause = () => {

    }

    return [stop, pause, unpause];

});

// Or just make a redirectable request to begin with?
//  Do like the idea of fitting a redirect function in where it fits...

// An outer call? Or at least towards the outside?

const obs_request_redirect = (obs_in) => obs((next, complete, error) => {
    // if we get a redirect (with location header) in the response, we then follow that location.
    //  could contribute to a map_redirect.

    // And in the observable result it would say it's been redirected and provide whatever new objects and events.

    // Run the normal observable?
    //  Or observe it, and if necessary, interrupt / restart / contrinue it.

    // Raise the events for the internal observable?
    //  Apart from complete, as there may be more to do in some cases.

    // could have different sending / response modes.
    //  redirection boolean value?

    let redirect = false, redirect_to;
    let obs_in_options;

    console.trace();

    obs_in.on('next', o_next => {
        const {response, type, options} = o_next;
        // can get the options from the original function call / inner observable.
        if (options) {
            obs_in_options = options;
        }


        


        if (response) {
            //  But there could be more than one response object in a sequence....
            const {headers, statusCode} = response;
            const encoding = headers['content-encoding'];
            console.log('statusCode', statusCode); // 301 is redirect

            // and if it's not a redirect status then continue with it.

            if (statusCode === 301) {

                // Stop, somehow?
                //  
                redirect = true;
                redirect_to = headers.location;

                // an internal observable that feeds through?
                //  Or is this an inconvenient place / way to do it?
                //   Because if it does redirect, then it loses the other processes / functions that it goes through.
                
                // If it's been redirected, could pass it back up?
                //  Redirection handler being on the inside?

                //const obs_request_redirected = obs_request_redirect()


            } else {
                //  Set up the end handler?


            }



            // if it's a redirect, then handle the redirection and return the data from that.

        }

        next(o_next);

    });

    // then then when the observable internally is complete...
    //  this observable here may not be complete.

    obs_in.on('complete', () => {

        if (redirect) {
            // A status to say it's doing the redirect?
            //  Or that could be assumed / discovered elsewhere if needed?

            //  Do another request....
            //   Would need some kind of parameter information or a way to recall the original function.

            // Some way to access original params seems important. Such as headers / cookies.


        } else {
            complete();
        }
    });



});

// obs_decompress_http_request_response
const obs_decompress = (obs_in) => obs((next, complete, error) => {

    let decompress_stream;
    let reading_stream;
    let redirecting = false;

    obs_in.on('next', o_next => {
        const {type} = o_next;

        console.log('type', type);

        // But was it redirected?

        if (type === 'redirect') {
            // then don't have a stream to read.
            console.log('o_next', o_next);
            redirecting = true;

            // then when the redirect is complete...?


            //throw 'NYI';
        }

        //if (type === 'response') {

        //}

        if (type === 'response') {
            const {response} = o_next;
            const {headers, statusCode} = response;
            const encoding = headers['content-encoding'];
            console.log('encoding', encoding);
            console.log('headers', headers);
            console.log('statusCode', statusCode);



            if (encoding === 'gzip') {
                decompress_stream = zlib.createGunzip();
                response.pipe(decompress_stream);

            } else if (encoding === undefined) {} else {
                throw 'NYI';
            }
            reading_stream = decompress_stream || response;

            let i = 0;

            reading_stream.on('data', chunk => {
                //console.log('chunk.length', chunk.length);
                next({
                    type: 'chunk',
                    chunk: chunk,
                    index: i++
                })
            });

            reading_stream.on('end', () => {
                if (!redirecting) {
                    complete();
                } else {
                    redirecting = false;
                }
                
            });

            //throw 'stop';
        }
    })

    // could look at the headers or other compression indicator(s).

    const stop = () => {

    }
    const pause = () => {

    }
    const unpause = () => {

    }

    return [stop, pause, unpause];
});

/*

// obs boilerplate / snipper material

const obs_request = (url, options) => obs((next, complete, error) => {


    // stop, pause, unpause

    const stop = () => {

    }
    const pause = () => {

    }
    const unpause = () => {

    }

    return [stop, pause, unpause];

})

*/

const hl_obs_request = (url, options) => obs((next, complete, error) => {

    // Handles compression (more) automatically.




    const stop = () => {

    }
    const pause = () => {

    }
    const unpause = () => {

    }

    return [stop, pause, unpause];

});

const obs_collect_chunks = (obs_in) => obs((next, complete, error) => {
    const chunks = [];

    obs_in.on('next', o_data => {
        //const kodata = Object.keys(o_data);
        //console.log('kodata', kodata);

        const {request, response, chunk} = o_data;
        if (chunk) {
            console.log('2) chunk.length', chunk.length);
            chunks.push(chunk);
        }
    });

    obs_in.on('complete', () => {
        console.log('collect chunks obs in complete');
        const data = Buffer.concat(chunks);
        //console.log('data.length', data.length);
        complete(data);
    });

});

// obs_timestamp
//  adds a timestamp attribute to the observable's events
// or obs itself could have an autotimestamp option or flag.



module.exports = {
    obs_request,
    obs_decompress,
    obs_collect_chunks
};

if (require.main === module) {
        
    (async() => {

        const url = 'https://telegraph.co.uk';
        //const url = 'https://www.theguardian.com/uk';

        const more_concise_get_https_sample = () => obs_collect_chunks(obs_decompress(obs_redirectable_request(url, {
            headers: {
                "accept-encoding" : "gzip,deflate"
            }
        })));

        console.log('pre call');
        const r1 = await more_concise_get_https_sample();
        console.log('r1.length', r1.length);
        //console.log('r1.toString()', r1.toString());

        const even_newer_get_https_sample = async() => {
            const res = await obs_collect_chunks(obs_decompress(obs_request('https://www.theguardian.com/uk', {
                headers: {
                    "accept-encoding" : "gzip,deflate"
                }
            })));
            console.log('res.length', res.length);
            return res;
            //const o2 = obs_collect_chunks(obsr);
            //obsr.on('complete', data => {
            //    console.log('o2 data.length', data.length);
            //})
        }
        //even_newer_get_https_sample();

        const newest_get_https_sample = () => {
            const obsr = obs_collect_chunks(obs_decompress(obs_request('https://www.theguardian.com/uk', {
                headers: {
                    "accept-encoding" : "gzip,deflate"
                }
            })));
            //const o2 = obs_collect_chunks(obsr);
            obsr.on('complete', data => {
                console.log('o2 data.length', data.length);
            })
        }
        //newest_get_https_sample();

        const newer_get_https_sample = () => {
            const obsr = obs_decompress(obs_request(url, {
                headers: {
                    "accept-encoding" : "gzip,deflate"
                }
            }));
            let headers;
            //console.log('obsr', obsr);
            const chunks = [];

            obsr.on('next', o_data => {
                //const kodata = Object.keys(o_data);
                //console.log('kodata', kodata);

                const {request, response, chunk} = o_data;
                if (chunk) {
                    chunks.push(chunk);
                }
            });

            obsr.on('complete', () => {
                const data = Buffer.concat(chunks);
                console.log('data.length', data.length);
            });
        }
        //newer_get_https_sample();

        

        const old = () => {


            const example_header_text = `
                For example...

                Host	www.lammertbies.nl
            Cookie	_ga=GA1.2.436584525.1662149826; _gid=GA1.2.1094409488.1662149826; _gat_UA-295305-1=1; FCCDCF=[null,null,null,["CPerMsAPerMsAEsABBENCfCoAP_AAH_AABpYHQpB7D7FbSFCyP55aLsAMAhXRkCEAqQAAASBAmABQAKQIAQCkkAQFASgBAACAAAgIAZBAQIMCAgACUABQABAAAEEAAAABAAIIAAAgAEAAAAIAAACAIAAAAAIAAAAEAAAmQhAAIIACAAABAAAAAAAAAAAAAAAAgdCgHsLsVtIUJI_GkoswAgCFdGQIQCoAAAAIECQAAAApAgBAKQQBAABKAEAAAAACAgBgEBAAgACAABQAFAAEAAAAAAAAAAAAggAACAAQAAAAAAAAIAgAAAAAgAAAAAAACJCEAAggAIAAAAAAAAAAAAAAAAAAACAAA.bkAAAAAAAAA","1~2072.70.89.93.108.122.149.2202.162.167.196.2253.241.2299.259.2357.311.317.323.2373.338.358.2415.415.440.449.2506.2526.482.486.494.495.2568.2571.2575.540.574.2624.2677.817.827.864.981.1048.1051.1095.1097.1127.1201.1205.1211.1276.1301.1365.1415.1449.1570.1577.1651.1716.1753.1765.1870.1878.1889.1958.2012","FC545726-76FC-4BC7-9F27-0F3C4E4E2C76"],null,null,[]]; __gads=ID=5937c275a242d772-2260708821d5001c:T=1662149845:RT=1662149845:S=ALNI_MaxfHxZrTWTtz_wMKprhOZVGvbfpQ; FCNEC=[["AKsRol-1wbtyt5c1IgN4EVCutUin6xKfs4Z_OMoCKS56aAwVTgln8BFlmRhN1tWn3WAd8Sn6IVRBOuzPnvmjKoWHBRjA2LRwWnRw-NKSLjcn2AA7W4TOXhAtp4wvch-Jeoxxd-BVwACqkya1AKlfVRobwUOqBElPOg=="],null,[]]
            Accept-Language	en-GB,en-US;q=0.9,en;q=0.8
            Accept-Encoding	gzip, deflate, br
            Sec-Fetch-Dest	document
            Sec-Fetch-User	?1
            Sec-Fetch-Mode	navigate
            Sec-Fetch-Site	none
            Accept	text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
            User-Agent	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36
            Upgrade-Insecure-Requests	1
            Sec-Ch-Ua-Platform	"macOS"
            Sec-Ch-Ua-Mobile	?0
            Sec-Ch-Ua	"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"

            `

            const request_headers = {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "en-GB,en;q=0.9",
                "upgrade-insecure-requests": "1",
                "sec-fetch-dest": "document",
                "sec-fetch-user": "?1",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-ch-ua-platform": "macOS",
                "sec-ch-ua-mobile": "?0",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
            };

            const obsr = obs_request(url, {
                headers: request_headers
            })

            const chunks = [];
            let decompress_stream;



            obsr.on('next', o_data => {
                const {request, response, chunk} = o_data;
                if (request) {
                    request.end();
                    
                } else if (response) {
                    headers = response.headers;
                    console.log('response headers', headers);

                    const statusCode = response.statusCode;

                    const encoding = headers['content-encoding'];
                    console.log('encoding', encoding);
                    if (encoding === 'gzip') {
                        decompress_stream = zlib.createGunzip();
                        response.pipe(decompress_stream);
                    } else if (encoding === 'deflate') {
                        decompress_stream = zlib.createDeflate();
                        response.pipe(decompress_stream);
                    } else {
                        //console.log('data.toString()', data.toString());
                    }

                    if (decompress_stream) {
                        decompress_stream.on('data', data => {
                            //console.log('decompress_stream data', data);
                            chunks.push(data);
                        })

                        decompress_stream.on('end', () => {
                            console.log('decompress stream end');
                            const data = Buffer.concat(chunks);
                            console.log('data.length', data.length);
                        })
                    }
                } else if (chunk) {
                    console.log('chunk.length', chunk.length); // possibly compressed


                    /*
                    const encoding = headers['content-encoding'];
                    console.log('encoding', encoding);
                    if (encoding === 'gzip') {
                        //zlib.gunzip(data, function(err, decoded) {
                            //callback(err, decoded && decoded.toString());
                        //    console.log('decoded.length', decoded.length);
                            //console.log('decoded.toString()', decoded.toString());
                        //});
                    } else if (encoding === 'deflate') {
                        zlib.inflate(buffer, function(err, decoded) {
                            //callback(err, decoded && decoded.toString());
                            console.log('decoded.length', decoded.length);
                            //console.log('decoded.toString()', decoded.toString());
                        })
                    } else {
                        console.log('data.toString()', data.toString());
                    }
                    */

                    //if (decompress_stream)

                    // 
                    
                    //chunks.push(chunk);
                }
                //console.log('o_data', o_data);

            })
            obsr.on('complete', () => {

                /*
                const data = Buffer.concat(chunks);
                console.log('data.length', data.length);

                const encoding = headers['content-encoding'];
                console.log('encoding', encoding);
                */

                /*
                if (encoding === 'gzip') {
                    zlib.gunzip(data, function(err, decoded) {
                        //callback(err, decoded && decoded.toString());
                        console.log('decoded.length', decoded.length);
                        //console.log('decoded.toString()', decoded.toString());
                    });
                } else if (encoding === 'deflate') {
                    zlib.inflate(buffer, function(err, decoded) {
                        //callback(err, decoded && decoded.toString());
                        console.log('decoded.length', decoded.length);
                        //console.log('decoded.toString()', decoded.toString());
                    })
                } else {
                    console.log('data.toString()', data.toString());
                }
                */

                
                //console.log('data.toString()', data.toString());
            });


        }
        //old();


        
    })();
} else {
    
}
