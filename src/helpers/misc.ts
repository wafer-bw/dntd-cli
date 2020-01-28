export function localNow(options?: {hhmmOnly: boolean}): string {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let now = new Date(Date.now() - tzoffset)
                           .toISOString()
                           .slice(0, -1)
                           .replace("T", " ")
                           .substr(0, 16);
    return (options && options.hhmmOnly) ? now.split(" ")[1] : now
}
