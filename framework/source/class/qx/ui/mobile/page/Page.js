/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * A page is a widget which provides a screen with which users
 * can interact in order to do something. Most times a page provides a single task
 * or a group of related tasks.
 *
 * A qooxdoo mobile application is usually composed of one or more loosely bound
 * pages. Typically there is one page that presents the "main" view.
 *
 * Pages can have one or more child widgets from the {@link qx.ui.mobile}
 * namespace. Normally a page provides a {@link qx.ui.mobile.navigationbar.NavigationBar}
 * for the navigation between pages.
 *
 * To navigate between two pages, just call the {@link #show} method of the page
 * that should be shown. Depending on the used page manager
 * ({@link qx.ui.mobile.page.manager.Simple} or {@link qx.ui.mobile.page.manager.Animation})
 * a page transition will be animated. There are several animations available. Have
 * a look at the {@link qx.ui.mobile.page.manager.Animation} manager for more information.
 *
 * A page has predefined lifecycle methods that get called by the used page manager
 * when a page gets shown. Each time another page is requested to be shown the currently shown page
 * is stopped. The other page, will be, if shown for the first time, initialized and started
 * afterwards. For all called lifecycle methods an event is fired.
 *
 * Call of the {@link #show} method triggers the following lifecycle methods:
 *
 * * <strong>initialize</strong>: Initializes the page to show
 * * <strong>start</strong>: Gets called when the page to show is started
 * * <strong>stop</strong>:  Stops the current page
 *
 * IMPORTANT: Define all child widgets of a page when the {@link #initialize} lifecycle
 * method is called, either by listening to the {@link #initialize} event or overriding
 * the {@link #_initialize} method. This is because a page can be instanced during
 * application startup and would then decrease performance when the widgets would be
 * added during constructor call. The <code>initialize</code> event and the
 * {@link #_initialize} lifecycle method are only called when the page is shown
 * for the first time.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *  // Create a page
 *  var page1 = new qx.ui.mobile.page.Page();
 *
 *  // Create all child widgets on initialize
 *  page1.addListener("initialize", function()
 *  {
 *    var button = new qx.ui.mobile.form.Button("Next Page");
 *    button.addListener("tap", function() {
 *      // show the next page
 *      page2.show();
 *    }, this);
 *    page1.add(button);
 *  },this);
 *
 *  // Create a second page
 *  var page2 = new qx.ui.mobile.page.Page();
 *
 *  // Create all child widgets on initialize
 *  page2.addListener("initialize", function()
 *  {
 *    var button = new qx.ui.mobile.form.Button("Back");
 *    button.addListener("tap", function() {
 *      // show the first page with a reverse animation if the Animation
 *      // page manager is used.
 *      page1.show({animation:"fade", reverse:true});
 *    }, this);
 * })
 *    page2.add(button);
 *  },this);
 *
 *  page1.show();
 * </pre>
 *
 * This example creates two pages with one button each. Tapping on the button
 * will show the page respectively.
 */
qx.Class.define("qx.ui.mobile.page.Page",
{
  extend : qx.ui.mobile.container.Composite,
  implement : qx.ui.mobile.container.INavigation,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(layout)
  {
    this.base(arguments, layout || new qx.ui.mobile.layout.VBox());
    this._setHeight(window.innerHeight);
    qx.event.Registration.addListener(window, "orientationchange", this._resize, this);
    qx.event.Registration.addListener(window, "resize", this._resize, this);
    this.addListener("domupdated", this._resize, this);
  },


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the lifecycle method {@link #initialize} is called */
    "initialize" : "qx.event.type.Event",

    /** Fired when the lifecycle method {@link #start} is called */
    "start" : "qx.event.type.Event",

    /** Fired when the lifecycle method {@link #stop} is called */
    "stop" : "qx.event.type.Event",

    /** Fired when the lifecycle method {@link #pause} is called */
    "pause" : "qx.event.type.Event",

    /** Fired when the lifecycle method {@link #resume} is called */
    "resume" : "qx.event.type.Event",

    /** Fired when the method {@link #back} is called. Data indicating 
     *  whether the action was triggered by a key event or not.
     */
    "back" : "qx.event.type.Data",

    /** Fired when the method {@link #menu} is called */
    "menu" : "qx.event.type.Event"
  },




 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "page"
    },


    /** The title of the page */
    title :
    {
      check : "String",
      init : "",
      event : "changeTitle",
      apply : "_applyTitle"
    }
  },


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __initialized : false,

    // overridden
    show : function(properties)
    {
      this.initialize();
      this.start();
      this.base(arguments, properties);
    },


    // overridden
    exclude : function(properties)
    {
      this.stop();
      this.base(arguments, properties);
    },


    /**
     * Resizes the page to the innerHeight of the window.
     */
    _resize : function()
    { 
      var parent = this.getLayoutParent();
      if (parent) {
        this._setHeight(parent.getContainerElement().offsetHeight)
      } 
    },


    /**
     * Sets the height of the container element.
     * 
     * @param height {Integer} The height to set
     */
    _setHeight : function(height) {
      var element = this.getContainerElement();
      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        qx.bom.element.Style.set(element, "minHeight", height + "px");
      } else {
        qx.bom.element.Style.set(element, "height", height + "px");
      }
    },


    /**
     * Fires the <code>back</code> event. Call this method if you want to request
     * a back action. For Android PhoneGap applications this method gets called
     * by the used page manager when the back button was pressed. Return <code>true</code>
     * to exit the application.
     *
     * @param triggeredByKeyEvent {Boolean} Whether the back action was triggered by a key event.
     * @return {Boolean} Whether the exit should be exit or not. Return <code>true</code
     *     to exit the application. Only needed for Android PhoneGap applications.
     */
    back : function(triggeredByKeyEvent)
    {
      this.fireDataEvent("back", triggeredByKeyEvent);
      var value = this._back(triggeredByKeyEvent);
      return value || false;
    },


    /**
     * Override this method if you want to perform a certain action when back
     * is called.
     *
     * @param triggeredByKeyEvent {Boolean} Whether the back action was triggered by a key event.
     * @return {Boolean} Whether the exit should be exit or not. Return <code>true</code
     *     to exit the application. Only needed for Android PhoneGap applications.
     * @see #back
     */
    _back : function(triggeredByKeyEvent)
    {

    },


    /**
     * Only used by Android PhoneGap applications. Called by the used page manager
     * when the menu button was pressed. Fires the <code>menu</code> event.
     */
    menu : function() {
      this.fireEvent("menu");
    },


    /*
    ---------------------------------------------------------------------------
      Lifecycle Methods
    ---------------------------------------------------------------------------
    */

    /**
     * Lifecycle method. Called by the page manager when the page is shown.
     * Fires the <code>initialize</code> event. You should create and add all your
     * child widgets of the view,  either by listening to the {@link #initialize} event or overriding
     * the {@link #_initialize} method. This is because a page can be instanced during
     * application startup and would then decrease performance when the widgets would be
     * added during constructor call. The {@link #_initialize} lifecycle method and the
     * <code>initialize</code> are only called once when the page is shown for the first time.
     */
    initialize : function()
    {
      if (!this.isInitialized())
      {
        this._initialize();
        this.__initialized = true;
        this.fireEvent("initialize");
      }
    },


    /**
     * Override this method if you would like to perform a certain action when initialize
     * is called.
     *
     * @see #initialize
     */
    _initialize : function()
    {

    },


    /**
     * Returns the status of the initialization of the page.
     *
     * @return {Boolean} Whether the page is already initialized or not
     */
    isInitialized : function()
    {
      return this.__initialized;
    },


    /**
     * Lifecycle method. Called by the page manager after the {@link #initialize}
     * method when the page is shown. Fires the <code>start</code> event. You should
     * register all your event listener when this event occurs, so that no page
     * updates are down when page is not shown.
     */
    start : function() {
      this._start();
      this.fireEvent("start");
    },


    /**
     * Override this method if you would like to perform a certain action when start
     * is called.
     *
     * @see #start
     */
    _start : function()
    {

    },


    /**
     * Lifecycle method. Called by the page manager when another page is shown.
     * Fires the <code>stop</code> event. You should unregister all your event
     * listener when this event occurs, so that no page updates are down when page is not shown.
     */
    stop : function()
    {
      this._stop();
      this.fireEvent("stop");
    },


    /**
     * Override this method if you would like to perform a certain action when stop
     * is called.
     *
     * @see #stop
     */
    _stop : function()
    {

    },


    /**
     * Lifecycle method. Not used right now. Should be called when the current page
     * is interrupted, e.g. by a dialog, so that page view updates can be interrupted.
     * Fires the <code>pause</code> event.
     */
    pause : function() {
      this._pause();
      this.fireEvent("pause");
    },


    /**
     * Override this method if you would like to perform a certain action when pause
     * is called.
     *
     * @see #pause
     */
    _pause : function()
    {

    },


    /**
     * Lifecycle method. Not used right now. Should be called when the current page
     * is resuming from a interruption, e.g. when a dialog is closed, so that page
     * can resume updating the view.
     * Fires the <code>resume</code> event.
     */
    resume : function() {
      this._resume();
      this.fireEvent("resume");
    },


    /**
     * Override this method if you would like to perform a certain action when resume
     * is called.
     *
     * @see #resume
     */
    _resume : function()
    {

    },


    // interface implementation
    getTitleWidget : function() {
      if (!this.__title) {
        this.__title = this._createTitleWidget();
      }
      return this.__title;
    },


    /**
     * Creates the navigation bar title.
     *
     * @return {qx.ui.mobile.navigationbar.Title} The created title widget
     */
    _createTitleWidget : function()
    {
      return new qx.ui.mobile.navigationbar.Title(this.getTitle());
    },


    // property apply
    _applyTitle : function(value, old) {
      if (this.__title) {
        this.__title.setValue(value);
      }
    },


    // interface implementation
    getLeftContainer : function() {
      return null;
    },


    // interface implementation
    getRightContainer : function() {
      return null;
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__title");
    this.__title = null;
    this.removeListener("domupdated", this._resize, this);
    qx.event.Registration.removeListener(window, "orientationchange", this._resize, this);
    qx.event.Registration.removeListener(window, "resize", this._resize, this);
  }
});
