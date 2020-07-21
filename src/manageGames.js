function main() {
    console.log('hello')

    const sliders = Array.from(document.querySelectorAll('slider > counter'))

    console.log(sliders)

    for (let slider of sliders) {
        const func = () => { slider.innerHTML = slider.previousElementSibling.value }
        slider.previousElementSibling.addEventListener('input', func)
        slider.previousElementSibling.addEventListener('change', func)
        func()
    }
}

if(document.readyState === "complete" || document.readyState === "interactive") {
    main()
} else {
    window.addEventListener("DOMContentLoaded", main)
}