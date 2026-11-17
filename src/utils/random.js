// Con esto podemos mantener el mismo dato asi recarguemosla página
export function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const between = (rand, min, max) => min + rand() * (max - min)

export const pick = (rand, list) => list[Math.floor(rand() * list.length)]