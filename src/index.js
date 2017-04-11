const extend = require('lodash/defaultsDeep')
const utils = require('./utils')

const enter = utils.createEvent('enter.wheninview')
const exit = utils.createEvent('exit.wheninview')

let win = { width: -1, height: -1 }

module.exports = {

    data: new WeakMap(),
    watched: [],

    watch: options => {

        // Handle shortcut options
        if( typeof options === 'string' ){
            options = {
                selector: options
            }
        }

        // Save options
        options = extend(options, {
            selector:           '.wheninview',
            className:          'element-in-view',
            container:          window,
            elementIn:          el => { utils.addClass(el, options.className) },
            elementOut:         () => { console.log('No exit.wheninview event defined') },
            topOffset:          0,
            bottomOffset:       0,
            staggerInterval:    0,
            removeWhenOut:      false,
            RAF:                true,       // if true, the master scroll event will be wrapped in a requestAnimationFrame
            fireAtStart:        true
        })

        var els = document.querySelectorAll(options.selector)

        // Prep callbacks
        els.forEach( el => {

            if( typeof options.elementIn === 'function' ){
                el.addEventListener( 'enter.wheninview', el => { options.elementIn(el) } )
            }

            if( typeof options.elementOut === 'function' ){
                el.addEventListener( 'exit.wheninview', el => { options.elementOut(el) } )
            }

            module.exports.watched.push(el)

            module.exports.data[el] = {}

            if( options.container !== window ){
                options.container = document.querySelector(options.container)
            }

            options.container.addEventListener('scroll', evt => { module.exports.calculateOffsets(el) } )


        })

        return els

    },

    calculateOffsets: el => {

        const rect = el.getBoundingClientRect()

        module.exports.data[el] = {
            docPosition: {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            },
            rect: rect,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
        }

    },

    isOverlapping: (rectA, rectB) => {

        module.exports.refresh()

        const a = module.exports.data[rectA]
        const b = module.exports.data[rectB]

        // http://stackoverflow.com/questions/13390333/two-rectangles-intersection
        if(
            a.left + a.width < b.left ||
            b.left + b.width < a.left ||
            a.top + a.height < b.top ||
            b.top + b.height < a.top
        ){
            return false
        } else {
            return true
        }

    },

    watchOverlap: ( optionsA, optionsB, callback ) => {

        const a = module.exports.watch(optionsA)[0]
        const b = module.exports.watch(optionsB)[0]

        window.addEventListener('scroll', () => {
            if( module.exports.isOverlapping(a, b) ){
                callback()
            }
        })

    },

    refresh: () => {

        module.exports.watched.forEach( el => {
            module.exports.calculateOffsets(el)
        })

    }
}
