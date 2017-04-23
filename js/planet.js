/**
 * Created by nikatlas on 3/20/2017.
 */
(function () {
    var PI2 = 2 * Math.PI;
    var SLOWDOWN = 1/1;

    function Planet(radius, sfreq, pfreq, distance,texture, light) {

        radius = 0.0005 * radius; // Adjust values so that we have a nice effect...
        distance = 1.1 * distance;
        sfreq = 10*sfreq * SLOWDOWN;
        pfreq = 100 *pfreq * SLOWDOWN;
        ///////////////////////////////////
        var
        segments = 64,
        material = new THREE.LineBasicMaterial( { color: 0xffffff } ),
        geometry = new THREE.CircleGeometry( distance, segments );
        // Remove center vertex
        geometry.vertices.shift();

        geometry.rotateX(Math.PI/2);

        var debug = new THREE.Line( geometry, material );
        ///////////////////////////////////
        this._debug = debug;
        this._distance = distance;
        this._pfreq    = pfreq;
        this._sfreq    = sfreq;
        this._radius   = radius;
        this._texture  = texture;
        this._entity   = null;
        this._children = [];
        this.phase     = Math.random()*5;
        this._light    = light;

        var ballGeo = new THREE.SphereGeometry( this._radius, 100, 100);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 16;

        this._entity = new THREE.Object3D();

        if(light){
            this._uniforms = {
                texture: { value: texture }
            };
            var material = new THREE.ShaderMaterial( {
                uniforms: this._uniforms,
                vertexShader: document.getElementById( 'vertexShaderDepth' ).textContent,
                fragmentShader: document.getElementById( 'fragmentShaderDepth' ).textContent
            } );
            this._mesh   = new THREE.Mesh(ballGeo, material);
            this._mesh.userData = {planet : true};
            this._mesh.name = "PlanetaMeshAstro" + Math.random();
            this._material = material;

            var pointLight = new THREE.PointLight( 0xffffff, 2  , 10000 , 2 );
            pointLight.castShadow = true;
            //Set up shadow properties for the light
            pointLight.shadow.mapSize.width = 2048;  // default
            pointLight.shadow.mapSize.height = 2048; // default
            pointLight.shadow.camera.near = 1;       // default
            pointLight.shadow.camera.far = 1000;     // default
            pointLight.position.set(0,0,0);

            this._mesh.castShadow = false;
            this._mesh.receiveShadow = false;
            this._entity.add( pointLight );
        }
        else {  // Changing the vertex shader here we could move the position/rotation computation to GPU
            var material = new THREE.MeshPhongMaterial({
                specular: 0x030303,
                map: texture,
                alphaTest: 0.8,
                shininess: 2,
                side: THREE.FrontSide
            });
            this._mesh   = new THREE.Mesh(ballGeo, material);
            this._mesh.userData = {planet : true};
            this._mesh.name = "PlanetaMesh" + Math.random();

            this._material = material;
            this._mesh.castShadow = true;
            this._mesh.receiveShadow = true;
        }
        this._entity.add(this._mesh);
    }

    Planet.prototype.add = function (p) {
        this._children.push(p);
    };
    Planet.prototype.animate = function (t) {
        for(var i in this._children){
            this._children[i].animate(t);
        }
        this._animate(t);
    };
    Planet.prototype._animate = function (t) {
        var vector = new THREE.Vector3(
            this._distance * Math.sin( PI2* this._pfreq * t + this.phase),
            0,
            this._distance * Math.cos( PI2 * this._pfreq * t + this.phase) );
        this._entity.position.copy(vector);
        this._mesh.rotation.y = PI2 * this._sfreq * t ;
    };
    Planet.prototype.setFrequency = function (f) {
        this._freq = f;
    };
    Planet.prototype.addToScene  = function (scene) {
        for(var i in this._children){
            this._children[i].addToScene(this._entity);
        }
        scene.add(this._entity);
    };
    Planet.prototype.showTrajectory = function (scene) {
        for (var i in this._children) {
            this._children[i].showTrajectory(this._entity);
        }
        if (this._distance)
            scene.add(this._debug);
    };
    Planet.prototype.hideTrajectory = function (scene) {
        for(var i in this._children){
            this._children[i].hideTrajectory(this._entity);
        }
        scene.remove(this._debug);
    };

    window.Planet =  Planet;
})();