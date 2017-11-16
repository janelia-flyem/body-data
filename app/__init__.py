from flask import Flask, render_template, flash, request, abort
import requests
import zlib
from settings_private import Settings

app = Flask(__name__)
app.jinja_env.auto_reload = True
settings = Settings()

def get_error(general):
   if general:
      return 'Page cannot be found. Please make sure, the URL is valid for this project and you are connected to the internal network of Janelia.'
   else:
      return 'There was an error while requesting the data. Please make sure this is a valid UUID which has body status data and you are connected to the internal network of Janelia.'


@app.route('/')
def get_data():
   try:
      id = settings.default_uuid
      url = settings.url.replace('[id]', id)
      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }
      return render_template('table.html',
                                 mytable=json_str,
                                 sortparams=sortparams,
                                 uuid=id,
                                 shark_url = settings.shark_url.replace('[id]', id),
                                 gallery_urlbase = settings.gallery_urlbase
                             )
   except Exception as e:
      error = get_error(False)
      print(e)
      return render_template('table.html', error=error)


@app.route('/uuid/<id>', methods=['GET'])
def get_data_uuid(id):
   try:
      url = settings.url.replace('[id]', id)
      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }
      return render_template('table.html',
                              mytable=json_str,
                              sortparams=sortparams,
                              uuid=id,
                              shark_url = settings.shark_url.replace('[id]', id),
                              gallery_urlbase = settings.gallery_urlbase
                           )
   except Exception as e:
      print(e)
      abort(404)

@app.route('/server/<server>/port/<port>/uuid/<uuid>', methods=['GET'])
def get_full_data(server, port, uuid):
   try:
      url = settings.full_url
      url = url.replace('[server]', server)
      url = url.replace('[port]', port)
      url = url.replace('[id]', uuid)
      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }
      return render_template('table.html',
                              mytable=json_str,
                              sortparams=sortparams,
                              uuid=uuid,
                              shark_url = settings.shark_url.replace('[id]', uuid),
                              gallery_urlbase = settings.gallery_urlbase
                           )
   except Exception as e:
      print(e)
      abort(404)

@app.errorhandler(404)
def page_not_found(error):
   return render_template('notfound.html', err=get_error(True)), 404