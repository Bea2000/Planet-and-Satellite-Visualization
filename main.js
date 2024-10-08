const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");
const PLANETAS = "https://gist.githubusercontent.com/Hernan4444/c3c1951d161fec6eea6cc70c9b06b597/raw/aa18adad0e830ba422446411691bd148131c6c2a/planetas.json"

const CATEGORIAS_POR_PLANETA = {
    'Mercury': "DemoranPoco", 'Venus': "DemoranPoco", 'Earth': "DemoranPoco",
    'Mars': "DemoranPoco", 'Jupiter': "DemoranPoco", 'Saturn': "DemoranMucho",
    'Uranus': "DemoranMucho", 'Neptune': "DemoranMucho", 'Pluto': "DemoranMucho"
}

const COLOR_TO_HEX = {
    "purple": "#BA33FF", "green": "#7FE264", "red": "#F25650"
}

const COLOR_POR_PLANETA = {
    'Mercury': "#A9A9A9", 'Venus': "#FFA500", 'Earth': COLOR_TO_HEX["green"],
    'Mars': COLOR_TO_HEX["red"], 'Jupiter': COLOR_TO_HEX["purple"], 'Saturn': "#DAA520",
    'Uranus': "#00BFFF", 'Neptune': "#00008B", 'Pluto': "#A9A9A9"
}

// Editar tamaños como estime conveniente
const WIDTH_VIS_1 = 1500;
const HEIGHT_VIS_1 = 800;

const WIDTH_VIS_2 = 1500;
const HEIGHT_VIS_2 = 1150;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

crearSistemaSolar();

function crearSistemaSolar() {
    /* 
    Esta función utiliza el dataset indicado en PLANETAS para crear el
    sistema solar.
    En esta están todos los planetas, pero no está el sol. Este último
    debe ser dibujado manualmente. El resto se debe dibujar aplicando datajoin 
    */
    d3.json(PLANETAS).then(dataPlanetas => {
        console.log(dataPlanetas.map(e => e.planet))

        /* Calcular temperatura mínima entre todos los planetas */
        const minTemperature = d3.min(dataPlanetas, d => d.mean_temperature);

        /* Calcular temperatura máxima entre todos los planetas */
        let maxTemperature = d3.max(dataPlanetas, d => d.mean_temperature);

        /* Calculamos escala de color entre rojo y azul */
        const color_scale = d3.scaleDiverging(t => d3.interpolateRdBu(1 - t))
            .domain([minTemperature, 0, maxTemperature])

        /* Creamos escala de tamaño para los planetas */
        const size_scale = d3.scaleLinear()
            .domain([d3.min(dataPlanetas, d => d.diameter), d3.max(dataPlanetas, d => d.diameter)*1.4])
            .range([20, WIDTH_VIS_1/10])
            
        /* Creamos escala logarítmica para posición de planetas respecto al sol */
        const position_scale = d3.scaleLog()
            .domain([d3.min(dataPlanetas, d => d.distance_from_sun)/(1.2), d3.max(dataPlanetas, d => d.distance_from_sun)])
            .range([300, WIDTH_VIS_1/(1.05)])

        /* Agregamos elipses a los planetas */
        SVG1.append("g")
        .selectAll("ellipse")
        .data(dataPlanetas)
        .enter()
        .append("ellipse")
        .attr("cx", 0)
        .attr("cy", HEIGHT_VIS_1 / 2)
        .attr("rx", d => position_scale(d.distance_from_sun)) // Aumenta el radio x
        .attr("ry", d => 0.5*position_scale(d.distance_from_sun)) // Deja el radio y igual
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.5);

        /* Creamos el sol */
        SVG1.append("g")
            .append("circle")
            .attr("cx", 0)
            .attr("cy", HEIGHT_VIS_1/2)
            .attr("r", 150)
            .attr("fill", "orange")

        /* Creamos un tooltip */
        d3.select("#vis-1")
            .append("div")
            .style("background-color", "#3BC570")
            .style("color", "white")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("opacity", 0.9)
            .attr("id", "tooltip")
            .style("display", "none")
            .style("position", "absolute")

        /* Creamos los planetas */
        SVG1.append("g")
            .attr("id", "planetas")
            .selectAll("circle")
            .data(dataPlanetas)
            .enter()
                .append("circle")
                .attr("cx", d => position_scale(d.distance_from_sun))
                .attr("cy", HEIGHT_VIS_1 / 2)
                .attr("r", d => size_scale(d.diameter))
                .attr("fill", d => color_scale(d.mean_temperature))
            /* Agregamos evento click para mostrar satelites */
            .on("click", function (e,element) {
                preprocesarSatelites(CATEGORIAS_POR_PLANETA[element.planet], false)
            })
            /* Mostramos tooltip en mouseover */
            .on("mousemove", function handleMouseOver(e, data) {
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", e.pageX + 10 + "px")
                    .style("top", e.pageY + 10 + "px")
                    .html(`<span style="font-size: 25px;">Nombre planeta: ${data.planet}</span>
                            <br>
                            <span style="font-size: 25px;">Distancia al sol: ${data.distance_from_sun}</span>
                            <br>
                            <span style="font-size: 25px;">Diametro: ${data.diameter}</span>
                            <br>
                            <span style="font-size: 25px;">Temperatura media: ${data.mean_temperature}</span>
                        `)
            })
            /* Ocultamos tooltip en mouseout */
            .on("mouseout", function (){
                d3.select("#tooltip")
                    .style("display", "none")
            })
        
        /* Agregamos texto a los planetas */
        SVG1.selectAll("text")
            .data(dataPlanetas)
            .enter()
                .append("text")
                .attr("x", d => position_scale(d.distance_from_sun))
                .attr("y", d => (size_scale(d.diameter)+HEIGHT_VIS_1/2)*1.1)
                .attr("fill", "white")
                .attr("font-size", 20)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text(d => d.planet)
        
    })


    /* 
    Cada vez que se haga click en un planeta. Debes llamar a
    preprocesarSatelites(categoria, false) donde "categoria" 
    el valor indicado en la constante CATEGORIAS_POR_PLANETA
    según el planeta seleccionado.
    Esta función se encargará de llamar a crearSatelites(...)
    */
}

/* Agregamos stroke a los planetas que sean de la categoria seleccionada */
function addStrokeToPlanets(category) {
    d3.json(PLANETAS).then(dataPlanetas => {
        d3.selectAll("#planetas")
                    .selectAll("circle")
                    .data(dataPlanetas)
                    .attr("stroke", function (dataPlaneta) {
                        // Vemos si la categoría del planeta seleccionado es igual a la categoría del planeta clickeado
                        if (CATEGORIAS_POR_PLANETA[dataPlaneta.planet] === category) {
                            return "white"; // Agregamos stroke a quienes cumplan la condición
                        } else {
                            return null;
                        }
                    })
                    .attr("stroke-width", function (dataPlaneta) {
                        if (CATEGORIAS_POR_PLANETA[dataPlaneta.planet] === category) {
                            return 8;
                        } else {
                            return null;
                        }
                    });
    })
}

function crearSatelites(dataset, categoria, filtrar_dataset, ordenar_dataset) {

    // Añadimos stroke a los planetas que sean de la categoria seleccionada
    addStrokeToPlanets(categoria)
    

    // 1. Actualizo nombre de un H4 para saber qué hacer con el dataset
    let texto = `Categoria: ${categoria} - Filtrar: ${filtrar_dataset} - Orden: ${ordenar_dataset}`
    d3.selectAll("#selected").text(texto)

    // 2. Nos quedamos con los satelites asociados a la categoría seleccionada
    let datos = dataset.filter(d => CATEGORIAS_POR_PLANETA[d.planet] == categoria)


    // 3. Filtrar, cuando corresponde, por magnitud
    // Completar aquí
    if (filtrar_dataset) {
        datos = datos.filter(d => d.radius > 100)
    }

    // 4. Quedarnos con solo 30 satelites. No editar esta línea
    datos = datos.slice(0, 30);

    // 5. Ordenar, según corresponda, los 30 satelites. Completar aquí
    if (ordenar_dataset === "alfabético"){
        datos.sort((a,b) => a.name.localeCompare(b.name))
    }
   else if (ordenar_dataset === "albedo") {
        datos.sort((a,b) => a.albedo - b.albedo)
   }

   const size_scale = d3.scaleLinear()
            .domain([d3.min(datos, d => d.radius), d3.max(datos, d => d.radius)])
            .range([10, 25])

    const color_scale = d3.scaleLinear()
        .domain([d3.min(datos, d => d.magnitude), d3.max(datos, d => d.magnitude)])
        .range(["white", "yellow"])

    const distance_scale = d3.scaleLinear()
        .domain([d3.min(datos, d => d.albedo), d3.max(datos, d => d.albedo)])
        .range([55, 80])

    /* Creamos un tooltip */
    d3.select("#vis-2")
        .append("div")
        .style("background-color", "#3BC570")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("opacity", 0.9)
        .attr("id", "tooltip")
        .style("display", "none")
        .style("position", "absolute")

    /* Change opacity */
    function changeOpacity(data, number){
        d3.selectAll(".satellite")
                .data(datos)
                .style("opacity", function (datos) {
                    if (datos.name === data.name) {
                        return 1;
                    } else {
                        return number;
                    }
        });
    }

    // 6. Confeccionar la visualización
    const satellites = SVG2
    .selectAll(".satellite")
    .data(datos)
    .join(
        enter => {
            const SATELITE = enter.append("g").attr("class", "satellite")

            // Agregamos linea vertical
            SATELITE.append("rect")
                .transition()
                .duration(500)
                .attr("class","vertical-line")
                .attr("y", (d, i) => 120 + Math.floor(i / 5) * 180)
                .attr("x", (d, i) => 125 + (i % 5) * 300)
                .attr("height", (d, i) => 80)
                .attr("fill", (d) => COLOR_POR_PLANETA[d.planet])
                .attr("width", 8)

            // Agregamos línea que va desde circulo izquierdo a tallo
            SATELITE.append("line")
                .transition()
                .duration(500)
                .attr("class","left-line")
                // tallo
                .attr("x1", (d, i) => 130 + (i % 5) * 300)
                // circulo izquierdo
                .attr("x2", (d, i) =>  130 - distance_scale(d.albedo) + (i % 5) * 300)
                // circulo izquierdo
                .attr("y2", (d, i) => 120 + Math.floor(i / 5) * 180)
                // tallo
                .attr("y1", (d, i) => 160 + Math.floor(i / 5) * 180)
                .attr("stroke", d => COLOR_POR_PLANETA[d.planet])
                .attr("stroke-width", 8);
            
            // Agregamos línea que va desde circulo derecho a tallo
            SATELITE.append("line")
                .transition()
                .duration(500)
                .attr("class","right-line")
                // tallo
                .attr("x1", (d, i) => 130 + (i % 5) * 300)
                // circulo derecho
                .attr("x2", (d, i) => 130 + distance_scale(d.albedo) + (i % 5) * 300)
                // circulo derecho
                .attr("y2", (d, i) => 120 + Math.floor(i / 5) * 180)
                // tallo
                .attr("y1", (d, i) => 160 + Math.floor(i / 5) * 180)
                .attr("stroke", d => COLOR_POR_PLANETA[d.planet])
                .attr("stroke-width", 8);

            // Agregamos círculo central
            SATELITE.append("circle")
                .transition()
                .duration(500)
                .attr("class","central-circle")
                .attr("fill", d => color_scale(d.magnitude))
                .attr("cx", (d, i) => 130 + (i % 5) * 300)
                .attr("cy", (d, i) => 120 + Math.floor(i / 5) * 180)
                .attr("r", d => size_scale(d.radius));

            // Agregamos círculo derecho
            SATELITE.append("circle")
                .transition()
                .duration(500)
                .attr("class","right-circle")
                .attr("r", 20)
                .attr("cy", (d, i) => 120 + Math.floor(i / 5) * 180)
                .attr("cx", (d, i) => 130 + distance_scale(d.albedo) + (i % 5) * 300)
                .attr("fill", d => COLOR_POR_PLANETA[d.planet]);

            // Agregamos círculo izquierdo
            SATELITE.append("circle")
                .transition()
                .duration(500)
                .attr("class","left-circle")
                .attr("r", 20)
                .attr("cy", (d, i) => 120 + Math.floor(i / 5) * 180)
                .attr("cx", (d, i) => 130 - distance_scale(d.albedo) + (i % 5) * 300)
                .attr("fill", d => COLOR_POR_PLANETA[d.planet]);
            
            // Agregamos texto
            SATELITE.append("text")
                .transition()
                .duration(500)
                .attr("class","text")
                .attr("x", (d, i) => 130 + (i % 5) * 300)
                .attr("y", (d, i) => 80 + Math.floor(i / 5) * 180)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", 20)
                .attr("fill", "white")
                .text(d => d.name);

            return SATELITE;
        },
        update => {

            update.select(".central-circle")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .attr("fill", d => color_scale(d.magnitude))
                .attr("r", d => size_scale(d.radius));

            update.select(".left-circle")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .attr("cx", (d, i) => 130 - distance_scale(d.albedo) + (i % 5) * 300)
                .attr("fill", d => COLOR_POR_PLANETA[d.planet]);

            update.select(".right-circle")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .attr("cx", (d, i) => 130 + distance_scale(d.albedo) + (i % 5) * 300)
                .attr("fill", d => COLOR_POR_PLANETA[d.planet]);

            update.select(".vertical-line")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .attr("fill", (d) => COLOR_POR_PLANETA[d.planet]);

            update.select(".left-line")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .attr("x2", (d, i) => 130 - distance_scale(d.albedo) + (i % 5) * 300)
                .attr("stroke", (d) => COLOR_POR_PLANETA[d.planet]);

            update.select(".right-line")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .attr("x2", (d, i) => 130 + distance_scale(d.albedo) + (i % 5) * 300)
                .attr("stroke", (d) => COLOR_POR_PLANETA[d.planet]);

            update.select(".text")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .text(d => d.name);

            return update;
        },
        exit => {
            // Opcional: Buscar cada elemento y eliminarlo
            // Spoiler: cuando veamos transiciones será util hacer esto
            exit.select(".central-circle")
                .transition()
                .duration(250)
                .attr("r", 0)
                .remove()
            exit.select(".left-circle")
                .transition()
                .duration(250)
                .attr("r", 0)
                .remove()
            exit.select(".right-circle")
                .transition()
                .duration(250)
                .attr("r", 0)
                .remove()
            exit.select(".text")
                .transition()
                .duration(250)
                .remove()
            exit.select(".left-line")
                .transition()
                .duration(250)
                .attr("stroke-width", 0)
                .remove()
            exit.select(".right-line")
                .transition()
                .duration(250)
                .attr("stroke-width", 0)
                .remove()
            exit.select(".vertical-line")
                .transition()
                .duration(250)
                .attr("width", 0)
                .remove()
    
            // Eliminamos el G
            exit
                .transition()
                .delay(500)
                .remove();
            // Retornamos exit
            return exit
        }
    )
    /* Mostramos tooltip en mouseover */
    .on("mouseover", function (e, data) {
        changeOpacity(data, 0.3)
        d3.select("#tooltip")
            .style("display", "block")
            .style("left", e.pageX + 20 + "px")
            .style("top", e.pageY + 20 + "px")
            .html(`<span style="font-size: 25px;">Nombre satelite: ${data.name}</span>
                    <br>
                    <span style="font-size: 25px;">Nombre planeta: ${data.planet}</span>
                    <br>
                    <span style="font-size: 25px;">Albedo: ${data.albedo}</span>
                    <br>
                    <span style="font-size: 25px;">Magnitud: ${data.magnitude}</span>
                    <br>
                    <span style="font-size: 25px;">Radio: ${data.radius}</span>
                `)
    }
    )
     /* Ocultamos tooltip en mouseout */
     .on("mouseout", function (){
        d3.select("#tooltip")
            .style("display", "none")
        d3.selectAll(".satellite")
            .style("opacity", 1)
    })
    ;
}

