const extend = require('lodash/defaultsDeep')
const utils = require('./utils')

const enter = utils.createEvent('enter.wheninview')
const exit = utils.createEvent('exit.wheninview')

module.exports = {

    overlapping: [],
    current: 0,
    watched: [],
    win: { height: -1 },
    scroll: { top: 0 },

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
            element:            false,
            container:          window,
            elementIn:          el => { utils.addClass(el, options.className) },
            elementOut:         () => { console.log('No exit.wheninview event defined') },
            topOffset:          0,
            bottomOffset:       0,
            staggerInterval:    0,
            removeWhenOut:      false,
            RAF:                true,       // if true, the master scroll event will be wrapped in a requestAnimationFrame
            fireAtStart:        true,
            overlap:            'viewport'
        })

        let els = []

        if( options.element !== false ){
            els.push(options.element)
        } else {
            els = document.querySelectorAll(options.selector)
        }

        // Prep callbacks
        els.forEach( el => {

            // Save container
            let container = options.container
            if( container !== window ){
                container = document.querySelector(options.container)

                // Handle if no container found
                if( container === null ){
                    console.log('No element called ' + options.container + ' found!')
                }
            }

            // Save index if we aren't yet watching
            const elIndex = el.getAttribute('data-wiv-index')
            if( elIndex === null ){
                el.setAttribute('data-wiv-index', module.exports.current++)
                module.exports.watched.push({
                    element: el,
                    container: container
                })
            }

            if( typeof options.elementIn === 'function' ){
                el.addEventListener( 'enter.wheninview', evt => { options.elementIn(el); } )
            }

            if( typeof options.elementOut === 'function' ){
                el.addEventListener( 'exit.wheninview', evt => { options.elementOut(el) } )
            }

            container.addEventListener('scroll', evt => {

                module.exports.refresh()

                if( module.exports.overlapping( el, options.overlap ) ){
                    el.dispatchEvent(enter)
                }
            })

        })

        module.exports.refresh()

        return els

    },

    refresh: () => {

        // Save window data
        module.exports.win.height = window.innerHeight || document.documentElement.clientHeight

        module.exports.watched.forEach( watched => {
            const rect = watched.element.getBoundingClientRect()
            watched.element.setAttribute('data-wiv-top', rect.top)
            watched.element.setAttribute('data-wiv-height', rect.height)
        })

    },

    overlapping: (a, b = 'viewport') => {

        if( a.getAttribute('data-wiv-index') === null ){
            module.exports.watch({
                element: a,
                elementIn: null
            })
        }

        // Special case for viewport
        if( b != 'viewport' ){
            if( b.getAttribute('data-wiv-index') === null ){
                module.exports.watch({
                    element: b,
                    elementIn: null
                })
            }
        } else {
            console.log('viewport')
        }

    }

    // calculateOffsets: el => {
    //
    //     const rect = el.getBoundingClientRect()
    //
    //     module.exports.data[el] = {
    //         docPosition: {
    //             top: rect.top + document.body.scrollTop,
    //             left: rect.left + document.body.scrollLeft
    //         },
    //         rect: rect,
    //         width: rect.width,
    //         height: rect.height,
    //         top: rect.top,
    //         left: rect.left
    //     }
    //
    // },
    //
    // isOverlapping: (rectA, rectB) => {
    //
    //     module.exports.refresh()
    //
    //     const a = module.exports.data[rectA]
    //     const b = module.exports.data[rectB]
    //
    //     // http://stackoverflow.com/questions/13390333/two-rectangles-intersection
    //     if(
    //         a.left + a.width < b.left ||
    //         b.left + b.width < a.left ||
    //         a.top + a.height < b.top ||
    //         b.top + b.height < a.top
    //     ){
    //         return false
    //     } else {
    //         return true
    //     }
    //
    // },
    //
    // watchOverlap: ( optionsA, optionsB, onOverlapEnter, onOverlapExit = null, containerSelector = false ) => {
    //
    //     const a = module.exports.watch(optionsA)[0]
    //     const b = module.exports.watch(optionsB)[0]
    //
    //     const container = containerSelector ? document.querySelector(containerSelector) : window
    //
    //     container.addEventListener('scroll', () => {
    //         const overlapping = module.exports.isOverlapping(a, b)
    //
    //         if( !module.exports.overlapping.includes( [a, b] ) && overlapping ){
    //             onOverlapEnter(a, b)
    //             module.exports.overlapping.push( [ a, b ] )
    //         }
    //
    //         if( module.exports.overlapping.indexOf( [a, b] ) !== -1 && !overlapping){
    //             onOverlapExit(a, b)
    //             module.exports.overlapping.splice( module.exports.overlapping.indexOf([a, b]) )
    //         }
    //     })
    //
    // },
    //
    // refresh: () => {
    //
    //     module.exports.watched.forEach( el => {
    //         module.exports.calculateOffsets(el)
    //     })
    //
    // }
}
