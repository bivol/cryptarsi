import { log } from '../log';

export function WaitOK(f: any, wait = 100, retry = 50) {
    return new Promise((resolve, reject) => {
        let count = retry;
        function check() {
            if (f()) {
                log('WaitOK is ready');
                return resolve();
            }
            if (--count > 0) {
                log('Not ready, wait', f());
                setTimeout(check, wait);
            } else {
                return reject();
            }
        }
        check();
    });
}
