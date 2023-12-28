import { Person } from "./types";

const me: Person = {
    name: 'Omkar',
    id: '658c906e5738f914150abfe4'
}

export function self(): Person {
    return me;
}