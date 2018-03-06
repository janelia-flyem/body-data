## Body-Data

This python flask application displays statistical body data and gives you the option to open a Shark view and a link to Neuroglancer to see the neuron to a body.

### How to use this repo

Please clone the repository to your machine and navigate into the root directory. With the python wrapper of your choice
(I use virtualenv), create a python environment. (You may have to define the path to your python using `-p`) To do that, run the following command on your command line:

```bash
$ virtualenv env --no-site-packages`
```

With

```bash
$ source env/bin/activate
```

you can activate the environment.

Then install the requirements using

```bash
$ pip install -r requirements.txt
```

You're all set! With

```bash
$ python src/home.py
```

you should be able to run the Flask application.

You can deactivate the environment using

```bash
$ deactivate
```

on your commandline.

Finally, please create a new file in src called settings_private.py as a copy of settings.py and fill in all the requested values.
