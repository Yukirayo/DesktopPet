export const elementStyleById = (options = []) => {
    options.forEach(option => {
        const element = document.getElementById(option[0])
        if (option[1]) element["style"][option[1]] = option[2]
    })
}