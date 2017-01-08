import { log } from '../log';
import { Config } from './Config';

export function WaitOK(f: any, wait = Config.waitTime, retry = Config.waitRetry) {
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
