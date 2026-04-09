export default function SectionHeading({ title, level }: { title: string; level: 1 | 2 | 3 | 4 | 5 | 6 }) {
    const commonStyles = `mt-3 mb-3 px-3 py-1 rounded-md bg-mist-600 dark:bg-mist-800 text-white`

    const levelStyles = {
        1: "text-4xl font-bold",
        2: "text-3xl font-bold",
        3: "text-2xl font-semibold",
        4: "text-xl font-semibold",
        5: "text-lg font-medium",
        6: "text-base font-medium",
    }

    const combined = `${commonStyles} ${levelStyles[level]}`

    switch (level) {
        case 1: return <h1 className={combined}>{title}</h1>
        case 2: return <h2 className={combined}>{title}</h2>
        case 3: return <h3 className={combined}>{title}</h3>
        case 4: return <h4 className={combined}>{title}</h4>
        case 5: return <h5 className={combined}>{title}</h5>
        case 6: return <h6 className={combined}>{title}</h6>
    }
}