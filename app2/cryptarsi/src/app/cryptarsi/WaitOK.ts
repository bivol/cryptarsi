export function WaitOK(f: any, wait = 100, retry = 50) {
    return new Promise((resolve, reject) => {
        let count = retry;
        function check() {
            if (f()) {
                return resolve();
            }
            if (--count > 0) {
                console.log('Not ready, wait', f());
                setTimeout(check, wait);
            } else {
                return reject();
            }
        }
        check();
    });
}
