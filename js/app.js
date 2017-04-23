// nikatlas -- Solar System
(function() {
    var MAX_CAM = 3000;
    var container, stats;
    var camera, scene, renderer;
    var controls;
    var clothGeometry;
    var sphere;
    var object;
    var ballPosition;
    var manager;
    var loader;
    var _textures = {};
    var animateable = [];

    function init() {
        container = document.createElement('div');
        document.body.appendChild(container);
        window.scene = scene = new THREE.Scene();
        scene.autoUpdate = false; // Magic optimization

        camera = createCamera(scene);
        addLights(scene);

        manager = new THREE.LoadingManager();
        loader = new THREE.TextureLoader(manager);
        // CreateSceneGraph after textures
        loadTextures();
        createScene(scene); // Hardcoded Skybox and general scene stuff (+may run while downloading textures)

        // renderer
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(new THREE.Color( 0x0aa000 ));

        container.appendChild(renderer.domElement);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // other THREE. PCFShadowMap
        // controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.75;
        controls.minDistance = 1;
        controls.maxDistance = MAX_CAM;

        window.addEventListener('resize', onWindowResize, false);
    }
    function createSkybox(scene) {
        /////////////////////////////////////////////////////////////////////
        ///// SKYBOX
        var urlPrefix = "textures/skybox/";
        var urls = [ "stars_right1.png",  "stars_left2.png",
            "stars_top3.png",  "stars_bottom4.png",
            "stars_front5.png", "stars_back6.png" ];
        var kloader = new THREE.CubeTextureLoader();
        kloader.setPath( urlPrefix );
        var textureCube = kloader.load( urls );
        var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, side : THREE.DoubleSide } );
        // build the skybox Mesh
        var geometry = new THREE.CubeGeometry( 4*MAX_CAM, 4*MAX_CAM, 4*MAX_CAM, 12 , 12 , 12 , null );
        var skyboxMesh    = new THREE.Mesh( geometry, material );
        // add it to the scene
        scene.add( skyboxMesh );
    }
    function createScene(scene){
        createSkybox(scene);
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // Automated Abstract Pipeline/Gameloop
    /// DEBUG SECTION ///
    var animating = true;
    function stopAnimations(){animating = false;frame = null;}
    function startAnimations(){animating = true;frame = window.performance.now()/1000.0;}
    var lastReq = null;
    // Custom timing
    var ctime = 0000;
    var frame = null;
    var dt = 0;
    var time;
    function animate() {
        time = window.performance.now()/1000.0;
        if(frame){
            dt = time - frame;
            ctime += dt;
            frame = time;
        }
        // Custom timing
        render(ctime);
        lastReq = requestAnimationFrame(animate);
    }
    function render(time) {
        if(animating)
            for(var i in animateable)
                animateable[i].animate(time);

        scene.updateMatrixWorld();
        controls.target.setFromMatrixPosition(target.matrixWorld);
        controls.update();
        scene.updateMatrixWorld();
        renderer.render(scene, camera);
    }
    // Helpers / Initializers
    function createCamera(scene) {
        var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000000);
        camera.position.x = 1000;
        camera.position.y = 1150;
        camera.position.z = 1500;
        scene.add(camera);
        return camera;
    }
    function addLights(scene) {
        scene.add(new THREE.AmbientLight(0x333333)); // Ambient light
    }
    function load(k,path) {
        _textures[k] = loader.load(path, THREE.SphericalRefractionMapping);
    }
    function loadTextures() {
        manager.onProgress = function () {
            console.log("Progress");
        }
        manager.onLoad = function(){
            console.log("[-] Textures Loaded!")
            computeGraph();
        }
        load('sun','textures/planets/sun.jpg');
        load('moon','textures/planets/moon_1024.jpg');
        load('mars','textures/planets/mars.jpg');
        load('venus','textures/planets/venus.jpg');
        load('jupiter','textures/planets/jupiter.jpg');
        load('mercury','textures/planets/mercurio.jpg');
        load('earth','textures/planets/earth.jpg');
        load('phobos','textures/planets/phobos.jpg');
        load('deimos','textures/planets/deimos.jpg');
        load('calisto','textures/planets/callisto.jpg');
        load('io','textures/planets/io.jpg');
        load('europa','textures/planets/europa.jpg');
    }
    var earth,moon,sun,europa;
    function computeGraph() {
        sun = new window.Planet(100000, 0.0005, 0, 0, _textures['sun'],true);

        var merc = new window.Planet(3031, 1/24/58.7, 1/24/87.96 ,36 , _textures['mercury']);
        var venus = new window.Planet(7521, 1/24/243, 1/24/224.68 ,67.2 , _textures['venus']);
         earth = new window.Planet(7926, 1/24, 1/24/365, 93, _textures['earth']);

            moon = new window.Planet(1131, 1/24/50, 1/24/3, 18, _textures['moon']);
            earth.add(moon);

        var mars = new window.Planet(4222, 1/24/1.026, 1/24/686.98, 141.6, _textures['mars']);
            var phobos = new window.Planet(200, 1/30/24, 1/24/8, 9, _textures['phobos']);
            mars.add(phobos);
            var deimos = new window.Planet(290, 1/30/24/4.90, 1/24/16, 12, _textures['deimos']);
            mars.add(deimos);

        var jupiter = new window.Planet(68729, 1/9.84, 1/24/365/11.862, 283.6, _textures['jupiter']);
            var io = new window.Planet(700, 1/30/24, 1/24/6, 50, _textures['io']);
            jupiter.add(io);
            europa = new window.Planet(550, 0, 1/10/9.84, 55, _textures['europa']);
            jupiter.add(europa);
            var calisto = new window.Planet(500, 1/30/24/3, 1/24/8.9, 59, _textures['calisto']);
            jupiter.add(calisto);
        sun.add( merc );
        sun.add( venus );
        sun.add( earth );
        sun.add( mars );
        sun.add( jupiter );
        sun.addToScene( scene );
        sun.showTrajectory(scene);
        animateable.push(sun);
        target = sun._entity;
        animate();
        return true;
    }
    // Input Handling
    var target;
    window.onkeydown = function (e) {
        if(e.keyCode == 69){ // e
            target = earth._entity; // private access only because i have no time to create abstract IO Service
        }
        else if(e.keyCode == 83){ // s
            target = sun._entity;
        }
        else if(e.keyCode == 77){ // m
            target = moon._entity;
        }
        if(e.keyCode == 80){ // p
            stopAnimations();
        }
        if(e.keyCode == 67){ // e
            startAnimations();
        }

        if(e.keyCode == 84){
            sun.showTrajectory(scene);
        }
        if(e.keyCode == 71){
            sun.hideTrajectory(scene);
        }

        console.log(e.keyCode);
    };
    var raycaster = new THREE.Raycaster();
    window.onmouseup = function (event) {
        var mx = ( event.clientX / window.innerWidth ) * 2 - 1;
        var my = - ( event.clientY / window.innerHeight ) * 2 + 1;
        var mouse = new THREE.Vector2(mx,my);
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects( scene.children, true );
        if(intersects.length && intersects[0].object.userData.planet){
            target = intersects[0].object;
        }

    };
    init();
})();


