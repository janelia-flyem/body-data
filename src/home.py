from flask import Flask, render_template, flash, request, abort
import gzip
import requests
import zlib

app = Flask(__name__)
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

def get_error():
   return 'There was an error while requesting the data. Please make sure this is a valid UUID which has body status data and you are connected to the internal network of Janelia.'



@app.route('/')
def get_data():
  # form = ReusableForm(request.form)
   # if request.method == 'GET':
      # name=request.form['name']
      # if form.validate():
      #    flash('Hello ' + name)
      # else:
      #    flash('All the form fields are required. ')
   try:
      url = 'http://emdata1:8700/api/node/18979088f9d248d6ac428df4cea022fe/bodyannotations/key/cx_body_status';
      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }
      return render_template('table.html', mytable=json_str, sortparams=sortparams, uuid='18979')
   except Exception as e:
      error = get_error()
      print(e)
      return render_template('table.html', error=error)


@app.route('/uuid/<id>', methods=['GET'])
def get_data_uuid(id):
   # form = ReusableForm(request.form)
   # if request.method == 'GET':
   #    name=request.form['name']
   #    if form.validate():
   #       flash('Hello ' + name)
   #    else:
   #       flash('All the form fields are required. ')
   url = 'http://emdata1:8700/api/node/' + id + '/bodyannotations/key/cx_body_status';
   try:
      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }
      return render_template('table.html', mytable=json_str, sortparams=sortparams, uuid=id)
   except Exception as e:
      print(e)
      abort(404)


@app.errorhandler(404)
def page_not_found(error):
   return render_template('notfound.html', err=get_error()), 404

def import_gzip():
   mypath = 'cx_body_status.gz'

   with gzip.GzipFile(mypath, 'r') as fin:             # 4. gzip
      json_bytes = fin.read()                          # 3. bytes (i.e. UTF-8)
      json_str = json_bytes.decode('utf-8')            # 2. string

   return json_str

if __name__ == '__main__':
   app.run(host='127.0.0.1', port=9999, use_reloader=True)
   app.config.from_object('table-data.default_settings')
