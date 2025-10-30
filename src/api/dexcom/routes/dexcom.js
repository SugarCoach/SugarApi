'use strict';

module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/dexcom/latest-egv/:id',
            handler: 'dexcom.latestEgv',
            config: { auth: false }, // cámbialo si querés protegerlo
        },
    ],
};
