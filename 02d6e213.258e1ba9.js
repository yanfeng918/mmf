(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{140:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return o})),a.d(t,"metadata",(function(){return i})),a.d(t,"rightToc",(function(){return l})),a.d(t,"default",(function(){return d}));var n=a(2),r=a(10),s=(a(0),a(175)),o={id:"dataset",title:"Adding a dataset",sidebar_label:"Adding a dataset"},i={id:"tutorials/dataset",title:"Adding a dataset",description:"[Outdated] A new version of this will be uploaded soon",source:"@site/docs/tutorials/dataset.md",permalink:"/docs/tutorials/dataset",editUrl:"https://github.com/facebookresearch/mmf/edit/master/website/docs/tutorials/dataset.md",lastUpdatedBy:"Amanpreet Singh",lastUpdatedAt:1600965809,sidebar_label:"Adding a dataset",sidebar:"docs",previous:{title:"MMF Projects",permalink:"/docs/notes/projects"},next:{title:"Tutorial: Adding a model - Concat BERT",permalink:"/docs/tutorials/concat_bert"}},l=[],c={rightToc:l};function d(e){var t=e.components,a=Object(r.a)(e,["components"]);return Object(s.b)("wrapper",Object(n.a)({},c,a,{components:t,mdxType:"MDXLayout"}),Object(s.b)("p",null,Object(s.b)("strong",{parentName:"p"},"[Outdated]")," A new version of this will be uploaded soon"),Object(s.b)("h1",{id:"mmf"},"MMF"),Object(s.b)("p",null,"This is a tutorial on how to add a new dataset to MMF."),Object(s.b)("p",null,"MMF is agnostic to kind of datasets that can be added to it. On high level, adding a dataset requires 4 main components."),Object(s.b)("ul",null,Object(s.b)("li",{parentName:"ul"},"Dataset Builder"),Object(s.b)("li",{parentName:"ul"},"Default Configuration"),Object(s.b)("li",{parentName:"ul"},"Dataset Class"),Object(s.b)("li",{parentName:"ul"},"Dataset's Metrics")),Object(s.b)("p",null,"In most of the cases, you should be able to inherit one of the existing datasets for easy integration. Let's start from the dataset builder"),Object(s.b)("h1",{id:"dataset-builder"},"Dataset Builder"),Object(s.b)("p",null,"Builder creates and returns an instance of :class:",Object(s.b)("inlineCode",{parentName:"p"},"mmf.datasets.base_dataset.BaseDataset")," which is inherited from ",Object(s.b)("inlineCode",{parentName:"p"},"torch.utils.data.dataset.Dataset"),". Any builder class in MMF needs to be inherited from :class:",Object(s.b)("inlineCode",{parentName:"p"},"mmf.datasets.base_dataset_builder.BaseDatasetBuilder"),". |BaseDatasetBuilder| requires user to implement following methods after inheriting the class."),Object(s.b)("ul",null,Object(s.b)("li",{parentName:"ul"},Object(s.b)("inlineCode",{parentName:"li"},"__init__(self):"))),Object(s.b)("p",null,"Inside this function call super().",Object(s.b)("strong",{parentName:"p"},"init"),'("name") where "name" should your dataset\'s name like "vqa2".'),Object(s.b)("ul",null,Object(s.b)("li",{parentName:"ul"},Object(s.b)("inlineCode",{parentName:"li"},"load(self, config, dataset_type, *args, **kwargs)"))),Object(s.b)("p",null,"This function loads the dataset, builds an object of class inheriting |BaseDataset| which contains your dataset logic and returns it."),Object(s.b)("ul",null,Object(s.b)("li",{parentName:"ul"},Object(s.b)("inlineCode",{parentName:"li"},"build(self, config, dataset_type, *args, **kwargs)"))),Object(s.b)("p",null,"This function actually builds the data required for initializing the dataset for the first time. For e.g. if you need to download some data for your dataset, this all should be done inside this function."),Object(s.b)("p",null,"Finally, you need to register your dataset builder with a key to registry using ",Object(s.b)("inlineCode",{parentName:"p"},'mmf.common.registry.registry.register_builder("key")'),"."),Object(s.b)("p",null,"That's it, that's all you require for inheriting |BaseDatasetBuilder|."),Object(s.b)("p",null,"Let's write down this using example of ",Object(s.b)("em",{parentName:"p"},"CLEVR")," dataset."),Object(s.b)("p",null,".. code-block:: python"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),'import json\nimport logging\nimport math\nimport os\nimport zipfile\n\nfrom collections import Counter\n\nfrom mmf.common.registry import registry\nfrom mmf.datasets.base_dataset_builder import BaseDatasetBuilder\n# Let\'s assume for now that we have a dataset class called CLEVRDataset\nfrom mmf.datasets.builders.clevr.dataset import CLEVRDataset\nfrom mmf.utils.general import download_file, get_mmf_root\n\n\nlogger = logging.getLogger(__name__)\n\n\n@registry.register_builder("clevr")\nclass CLEVRBuilder(BaseDatasetBuilder):\n    DOWNLOAD_URL = ""https://dl.fbaipublicfiles.com/clevr/CLEVR_v1.0.zip"\n\n    def __init__(self):\n        # Init should call super().__init__ with the key for the dataset\n        super().__init__("clevr")\n\n        # Assign the dataset class\n        self.dataset_class = CLEVRDataset\n\n    def build(self, config, dataset):\n        download_folder = os.path.join(\n            get_mmf_root(), config.data_dir, config.data_folder\n        )\n\n        file_name = self.DOWNLOAD_URL.split("/")[-1]\n        local_filename = os.path.join(download_folder, file_name)\n\n        extraction_folder = os.path.join(download_folder, ".".join(file_name.split(".")[:-1]))\n        self.data_folder = extraction_folder\n\n        # Either if the zip file is already present or if there are some\n        # files inside the folder we don\'t continue download process\n        if os.path.exists(local_filename):\n            return\n\n        if os.path.exists(extraction_folder) and \\\n            len(os.listdir(extraction_folder)) != 0:\n            return\n\n        logger.info("Downloading the CLEVR dataset now")\n        download_file(self.DOWNLOAD_URL, output_dir=download_folder)\n\n        logger.info("Downloaded. Extracting now. This can take time.")\n        with zipfile.ZipFile(local_filename, "r") as zip_ref:\n            zip_ref.extractall(download_folder)\n\n\n    def load(self, config, dataset, *args, **kwargs):\n        # Load the dataset using the CLEVRDataset class\n        self.dataset = CLEVRDataset(\n            config, dataset, data_folder=self.data_folder\n        )\n        return self.dataset\n\n    def update_registry_for_model(self, config):\n        # Register both vocab (question and answer) sizes to registry for easy access to the\n        # models. update_registry_for_model function if present is automatically called by\n        # MMF\n        registry.register(\n            self.dataset_name + "_text_vocab_size",\n            self.dataset.text_processor.get_vocab_size(),\n        )\n        registry.register(\n            self.dataset_name + "_num_final_outputs",\n            self.dataset.answer_processor.get_vocab_size(),\n        )\n')),Object(s.b)("h1",{id:"default-configuration"},"Default Configuration"),Object(s.b)("p",null,"Some things to note about MMF's configuration:"),Object(s.b)("ul",null,Object(s.b)("li",{parentName:"ul"},"Each dataset in MMF has its own default configuration which is usually under this structure ",Object(s.b)("inlineCode",{parentName:"li"},"mmf/common/defaults/configs/datasets/[task]/[dataset].yaml")," where ",Object(s.b)("inlineCode",{parentName:"li"},"task")," is the task your dataset belongs to."),Object(s.b)("li",{parentName:"ul"},"These dataset configurations can be then included by the user in their end config using ",Object(s.b)("inlineCode",{parentName:"li"},"includes")," directive"),Object(s.b)("li",{parentName:"ul"},"This allows easy multi-tasking and management of configurations and user can also override the default configurations easily in their own config")),Object(s.b)("p",null,"So, for CLEVR dataset also, we will need to create a default configuration."),Object(s.b)("p",null,"The config node is directly passed to your builder which you can then pass to your dataset for any configuration that you need for building your dataset."),Object(s.b)("p",null,"Basic structure for a dataset configuration looks like below:"),Object(s.b)("p",null,".. code-block:: yaml"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),"dataset_config:\n    [dataset]:\n        ... your config here\n")),Object(s.b)("p",null,".. note:"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),"``processors`` in your dataset configuration are directly converted to attributes based on the key and are\nautomatically initialized with parameters mentioned in the config.\n")),Object(s.b)("p",null,"Here, is a default configuration for CLEVR needed based on our dataset and builder class above:"),Object(s.b)("p",null,".. code-block:: yaml"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),'dataset_config:\n    # You can specify any attributes you want, and you will get them as attributes\n    # inside the config passed to the dataset. Check the Dataset implementation below.\n    clevr:\n        # Where your data is stored\n        data_dir: ${env.data_dir}\n        data_folder: CLEVR_v1.0\n        # Any attribute that you require to build your dataset but are configurable\n        # For CLEVR, we have attributes that can be passed to vocab building class\n        build_attributes:\n            min_count: 1\n            split_regex: " "\n            keep:\n                - ";"\n                - ","\n            remove:\n                - "?"\n                - "."\n        processors:\n        # The processors will be assigned to the datasets automatically by MMF\n        # For example if key is text_processor, you can access that processor inside\n        # dataset object using self.text_processor\n            text_processor:\n                type: vocab\n                params:\n                    max_length: 10\n                    vocab:\n                        type: random\n                        vocab_file: vocabs/clevr_question_vocab.txt\n                # You can also specify a processor here\n                preprocessor:\n                    type: simple_sentence\n                    params: {}\n            answer_processor:\n                # Add your processor for answer processor here\n                type: multi_hot_answer_from_vocab\n                params:\n                    num_answers: 1\n                    # Vocab file is relative to [data_dir]/[data_folder]\n                    vocab_file: vocabs/clevr_answer_vocab.txt\n                    preprocessor:\n                        type: simple_word\n                        params: {}\n')),Object(s.b)("p",null,"For processors, check :class:",Object(s.b)("inlineCode",{parentName:"p"},"mmf.datasets.processors")," to understand how to create a processor and different processors that are already available in MMF."),Object(s.b)("h1",{id:"dataset-class"},"Dataset Class"),Object(s.b)("p",null,"Next step is to actually build a dataset class which inherits |BaseDataset| so it can interact with PyTorch dataloaders. Follow the steps below to inherit and create your dataset's class."),Object(s.b)("ul",null,Object(s.b)("li",{parentName:"ul"},"Inherit :class:",Object(s.b)("inlineCode",{parentName:"li"},"mmf.datasets.base_dataset.BaseDataset")),Object(s.b)("li",{parentName:"ul"},"Implement ",Object(s.b)("inlineCode",{parentName:"li"},"__init__(self, config, dataset)"),". Call parent's init using ",Object(s.b)("inlineCode",{parentName:"li"},'super().__init__("name", config, dataset)'),' where "name" is the string representing the name of your dataset.'),Object(s.b)("li",{parentName:"ul"},"Implement ",Object(s.b)("inlineCode",{parentName:"li"},"__getitem__(self, idx)"),", our replacement for normal ",Object(s.b)("inlineCode",{parentName:"li"},"__getitem__(self, idx)")," you would implement for a torch dataset. This needs to return an object of class :class:Sample."),Object(s.b)("li",{parentName:"ul"},"Implement ",Object(s.b)("inlineCode",{parentName:"li"},"__len__(self)")," method, which represents size of your dataset."),Object(s.b)("li",{parentName:"ul"},"[Optional]"," Implement ",Object(s.b)("inlineCode",{parentName:"li"},"load_item(self, idx)")," if you need to load something or do something else with data and then call it inside ",Object(s.b)("inlineCode",{parentName:"li"},"__getitem__"),".")),Object(s.b)("p",null,".. note:"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),"Actual implementation of the dataset might differ due to support for distributed training.\n")),Object(s.b)("p",null,".. code-block:: python"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),'import os\nimport json\n\nimport numpy as np\nimport torch\n\nfrom PIL import Image\n\nfrom mmf.common.registry import registry\nfrom mmf.common.sample import Sample\nfrom mmf.datasets.base_dataset import BaseDataset\nfrom mmf.utils.general import get_mmf_root\nfrom mmf.utils.text import VocabFromText, tokenize\n\n\nclass CLEVRDataset(BaseDataset):\n    def __init__(self, config, dataset, data_folder=None, *args, **kwargs):\n        super().__init__("clevr", config, dataset)\n        self._data_folder = data_folder\n        self._data_dir = os.path.join(get_mmf_root(), config.data_dir)\n\n        if not self._data_folder:\n            self._data_folder = os.path.join(self._data_dir, config.data_folder)\n\n        if not os.path.exists(self._data_folder):\n            raise RuntimeError(\n                "Data folder {} for CLEVR is not present".format(self._data_folder)\n            )\n\n        # Check if the folder was actually extracted in the subfolder\n        if config.data_folder in os.listdir(self._data_folder):\n            self._data_folder = os.path.join(self._data_folder, config.data_folder)\n\n        if len(os.listdir(self._data_folder)) == 0:\n            raise RuntimeError("CLEVR dataset folder is empty")\n\n        self._load()\n\n    def _load(self):\n        self.image_path = os.path.join(self._data_folder, "images", self._dataset_type)\n\n        with open(\n            os.path.join(\n                self._data_folder,\n                "questions",\n                "CLEVR_{}_questions.json".format(self._dataset_type),\n            )\n        ) as f:\n            self.questions = json.load(f)["questions"]\n            self._build_vocab(self.questions, "question")\n            self._build_vocab(self.questions, "answer")\n\n    def __len__(self):\n        # __len__ tells how many samples are there\n        return len(self.questions)\n\n    def _get_vocab_path(self, attribute):\n        return os.path.join(\n            self._data_dir, "vocabs",\n            "{}_{}_vocab.txt".format(self.dataset_name, attribute)\n        )\n\n    def _build_vocab(self, questions, attribute):\n        # This function builds vocab for questions and answers but not required for the\n        # tutorial\n        ...\n\n    def __getitem__(self, idx):\n        # Get item is like your normal __getitem__ in PyTorch Dataset. Based on id\n        # return a sample. Check VQA2Dataset implementation if you want to see how\n        # to do caching in MMF\n        data = self.questions[idx]\n\n        # Each call to __getitem__ from dataloader returns a Sample class object which\n        # collated by our special batch collator to a SampleList which is basically\n        # a attribute based batch in layman terms\n        current_sample = Sample()\n\n        question = data["question"]\n        tokens = tokenize(question, keep=[";", ","], remove=["?", "."])\n\n        # This processors are directly assigned as attributes to dataset based on the config\n        # we created above\n        processed = self.text_processor({"tokens": tokens})\n        # Add the question as text attribute to the sample\n        current_sample.text = processed["text"]\n\n        processed = self.answer_processor({"answers": [data["answer"]]})\n        # Now add answers and then the targets. We normally use "targets" for what\n        # should be the final output from the model in MMF\n        current_sample.answers = processed["answers"]\n        current_sample.targets = processed["answers_scores"]\n\n        image_path = os.path.join(self.image_path, data["image_filename"])\n        image = np.true_divide(Image.open(image_path).convert("RGB"), 255)\n        image = image.astype(np.float32)\n        # Process and add image as a tensor\n        current_sample.image = torch.from_numpy(image.transpose(2, 0, 1))\n\n        # Return your sample and MMF will automatically convert it to SampleList before\n        # passing to the model\n        return current_sample\n')),Object(s.b)("h1",{id:"metrics"},"Metrics"),Object(s.b)("p",null,"For your dataset to be compatible out of the box, it is a good practice to also add the metrics your dataset requires. All metrics for now go inside ",Object(s.b)("inlineCode",{parentName:"p"},"MMF/modules/metrics.py"),". All metrics inherit |BaseMetric| and implement a function ",Object(s.b)("inlineCode",{parentName:"p"},"calculate")," with signature ",Object(s.b)("inlineCode",{parentName:"p"},"calculate(self, sample_list, model_output, *args, **kwargs)")," where ",Object(s.b)("inlineCode",{parentName:"p"},"sample_list")," (|SampleList|) is the current batch and ",Object(s.b)("inlineCode",{parentName:"p"},"model_output")," is a dict return by your model for current ",Object(s.b)("inlineCode",{parentName:"p"},"sample_list"),". Normally, you should define the keys you want inside ",Object(s.b)("inlineCode",{parentName:"p"},"model_output")," and ",Object(s.b)("inlineCode",{parentName:"p"},"sample_list"),". Finally, you should register your metric to registry using ",Object(s.b)("inlineCode",{parentName:"p"},"@registry.register_metric('[key]')")," where '","[key]","' is the key for your metric. Here is a sample implementation of accuracy metric used in CLEVR dataset:"),Object(s.b)("p",null,".. code-block: python"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{}),'@registry.register_metric("accuracy")\nclass Accuracy(BaseMetric):\n    """Metric for calculating accuracy.\n\n    **Key:** ``accuracy``\n    """\n\n    def __init__(self):\n        super().__init__("accuracy")\n\n    def calculate(self, sample_list, model_output, *args, **kwargs):\n        """Calculate accuracy and return it back.\n\n        Args:\n            sample_list (SampleList): SampleList provided by DataLoader for\n                                current iteration\n            model_output (Dict): Dict returned by model.\n\n        Returns:\n            torch.FloatTensor: accuracy.\n\n        """\n        output = model_output["scores"]\n        expected = sample_list["targets"]\n\n        if output.dim() == 2:\n            output = torch.max(output, 1)[1]\n\n        # If more than 1\n        if expected.dim() == 2:\n            expected = torch.max(expected, 1)[1]\n\n        correct = (expected == output.squeeze()).sum().float()\n        total = len(expected)\n\n        value = correct / total\n        return value\n')),Object(s.b)("p",null,"These are the common steps you need to follow when you are adding a dataset to MMF."),Object(s.b)("p",null,".. |BaseDatasetBuilder| replace:: :class:",Object(s.b)("inlineCode",{parentName:"p"},"~mmf.datasets.base_dataset_builder.BaseDatasetBuilder")," .. |BaseDataset| replace:: :class:",Object(s.b)("inlineCode",{parentName:"p"},"~mmf.datasets.base_dataset.BaseDataset")," .. |SampleList| replace:: :class:",Object(s.b)("inlineCode",{parentName:"p"},"~mmf.common.sample.SampleList")," .. |BaseMetric| replace:: :class:",Object(s.b)("inlineCode",{parentName:"p"},"~mmf.modules.metrics.BaseMetric")))}d.isMDXComponent=!0},175:function(e,t,a){"use strict";a.d(t,"a",(function(){return u})),a.d(t,"b",(function(){return b}));var n=a(0),r=a.n(n);function s(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){s(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},s=Object.keys(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var c=r.a.createContext({}),d=function(e){var t=r.a.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=d(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,s=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=d(a),m=n,b=u["".concat(o,".").concat(m)]||u[m]||p[m]||s;return a?r.a.createElement(b,i(i({ref:t},c),{},{components:a})):r.a.createElement(b,i({ref:t},c))}));function b(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var s=a.length,o=new Array(s);o[0]=m;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:n,o[1]=i;for(var c=2;c<s;c++)o[c]=a[c];return r.a.createElement.apply(null,o)}return r.a.createElement.apply(null,a)}m.displayName="MDXCreateElement"}}]);