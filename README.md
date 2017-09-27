## Body-Data

This python flask application displays statistical body data and gives you the option to open a Shark view and a link to Neuroglancer to see the neuron to a body.

### How to use this repo

Clone the repository to your machine and navigate into the root directory. With the python wrapper of your choice
(I use virtualenv) create a python environment. (You may have to define the path to your python using `-p`) On your command line, type:

`virtualenv env --no-site-packages`

With

`source env/bin/activate`

you can activate the environment.

Then install the requirements using

`pip install -r requirements.txt`

You're all set! With

`python src/home.py`

you should be able to run the Flask application.

You can deactivate the environment using

`deactivate`

on your commandline.