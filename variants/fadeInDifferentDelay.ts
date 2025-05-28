const fadeInDifferentDelay=({delay,duration}:{delay:number,duration:number})=>({
initial:{
    opacity:0,
    y:50
},
animate:(custom:number)=>({
    opacity:1,
    y:0,
    transition:{

        delay: delay * custom/2,
        duration:duration,
        ease:[0.25,0.25,0.25,0.75]

        
    }
})

})

export default fadeInDifferentDelay;