export class Tag {
    public frq: number

    constructor(public raw: string, public key: string, public val: string | null, frq?: number) {
        this.frq = frq || 1
    }

    public toString(): string {
        return `${this.raw} (${this.frq})`
    }

    public print(): void {
        console.log(this.toString())
    }

}
